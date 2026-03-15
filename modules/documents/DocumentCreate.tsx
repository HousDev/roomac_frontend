// import { useState, useEffect } from 'react';
// import { FileText, Eye, Save, X, ChevronLeft, ChevronRight, Clock, CheckCircle, Ligature as FileSignature, Share2, AlertCircle, Search, Filter } from 'lucide-react';
// // import { supabase } from '../../lib/supabase';
// import { DocumentTemplate } from '../../types/document';

// export function DocumentCreate() {
//   const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
//   const [filteredTemplates, setFilteredTemplates] = useState<DocumentTemplate[]>([]);
//   const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
//   const [step, setStep] = useState(1);
//   const [formData, setFormData] = useState<Record<string, any>>({});
//   const [previewHtml, setPreviewHtml] = useState('');
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('All');

//   const [documentSettings, setDocumentSettings] = useState({
//     signatureRequired: false,
//     priority: 'normal',
//     expiryDate: '',
//     tags: [] as string[],
//     notes: ''
//   });

//   useEffect(() => {
//     fetchTemplates();
//   }, []);

//   useEffect(() => {
//     filterTemplates();
//   }, [templates, searchTerm, selectedCategory]);

//   const fetchTemplates = async () => {
//     try {
//       const { data, error } = await supabase
//         .from('document_templates')
//         .select('*')
//         .eq('is_active', true)
//         .order('name');

//       if (error) throw error;
//       setTemplates(data || []);
//       setFilteredTemplates(data || []);
//     } catch (error) {
//       console.error('Error fetching templates:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterTemplates = () => {
//     let filtered = [...templates];

//     if (selectedCategory !== 'All') {
//       filtered = filtered.filter(t => t.category === selectedCategory);
//     }

//     if (searchTerm.trim()) {
//       const search = searchTerm.toLowerCase();
//       filtered = filtered.filter(t =>
//         t.name.toLowerCase().includes(search) ||
//         t.category.toLowerCase().includes(search) ||
//         t.description?.toLowerCase().includes(search)
//       );
//     }

//     setFilteredTemplates(filtered);
//   };

//   const categories = ['All', ...Array.from(new Set(templates.map(t => t.category))).sort()];

//   const handleTemplateSelect = (template: DocumentTemplate) => {
//     setSelectedTemplate(template);
//     const initialData: Record<string, any> = {
//       date: new Date().toISOString().split('T')[0],
//       document_number: 'AUTO-GENERATED'
//     };
//     template.variables.forEach(variable => {
//       if (!initialData[variable]) {
//         initialData[variable] = '';
//       }
//     });
//     setFormData(initialData);
//     setStep(2);
//   };

//   const generatePreview = () => {
//     if (!selectedTemplate) return;

//     let html = selectedTemplate.html_content;
//     Object.keys(formData).forEach(key => {
//       const value = formData[key] || `[${key}]`;
//       html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
//     });

//     setPreviewHtml(html);
//     setShowPreview(true);
//   };

//   const handleSave = async () => {
//     if (!formData.tenant_name || !formData.tenant_phone) {
//       alert('Please fill in required fields: Tenant Name and Tenant Phone');
//       return;
//     }

//     try {
//       setSaving(true);

//       let html = selectedTemplate!.html_content;
//       Object.keys(formData).forEach(key => {
//         const value = formData[key] || '';
//         html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
//       });

//       const documentData = {
//         template_id: selectedTemplate!.id,
//         document_number: '',
//         document_name: selectedTemplate!.name,
//         tenant_name: formData.tenant_name || 'N/A',
//         tenant_phone: formData.tenant_phone || 'N/A',
//         tenant_email: formData.tenant_email,
//         property_name: formData.property_name,
//         room_number: formData.room_number,
//         html_content: html,
//         data_json: formData,
//         status: 'Created',
//         created_by: 'Admin',
//         signature_required: documentSettings.signatureRequired,
//         priority: documentSettings.priority,
//         expiry_date: documentSettings.expiryDate || null,
//         tags: documentSettings.tags,
//         notes: documentSettings.notes
//       };

//       const { data: docData, error: docError } = await supabase
//         .from('documents')
//         .insert([documentData])
//         .select()
//         .single();

//       if (docError) throw docError;

//       const { error: historyError } = await supabase
//         .from('document_status_history')
//         .insert([{
//           document_id: docData.id,
//           status: 'Created',
//           event_type: 'Created',
//           event_description: `Document "${selectedTemplate!.name}" created`,
//           performed_by: 'Admin',
//           metadata: {
//             template_name: selectedTemplate!.name,
//             tenant_name: formData.tenant_name,
//             signature_required: documentSettings.signatureRequired,
//             priority: documentSettings.priority
//           }
//         }]);

//       if (historyError) throw historyError;

//       alert(`Document created successfully!\nDocument Number: ${docData.document_number}\n\nYou can now view, share, or track this document from the Document List.`);

//       setStep(1);
//       setSelectedTemplate(null);
//       setFormData({});
//       setDocumentSettings({
//         signatureRequired: false,
//         priority: 'normal',
//         expiryDate: '',
//         tags: [],
//         notes: ''
//       });
//     } catch (error) {
//       console.error('Error creating document:', error);
//       alert('Failed to create document: ' + (error as any).message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const getFieldLabel = (variable: string): string => {
//     return variable
//       .split('_')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };

//   const getFieldType = (variable: string): string => {
//     if (variable.includes('date')) return 'date';
//     if (variable.includes('email')) return 'email';
//     if (variable.includes('phone')) return 'tel';
//     if (variable.includes('amount') || variable.includes('deposit') || variable.includes('rent')) return 'number';
//     return 'text';
//   };

//   const addTag = (tag: string) => {
//     if (tag && !documentSettings.tags.includes(tag)) {
//       setDocumentSettings({
//         ...documentSettings,
//         tags: [...documentSettings.tags, tag]
//       });
//     }
//   };

//   const removeTag = (tag: string) => {
//     setDocumentSettings({
//       ...documentSettings,
//       tags: documentSettings.tags.filter(t => t !== tag)
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-gray-500">Loading templates...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-sm">
//         <div className="flex items-center gap-3">
//           <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg">
//             <FileText className="w-8 h-8 text-white" />
//           </div>
//           <div>
//             <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//               Create Document
//             </h1>
//             <p className="text-gray-600 font-semibold mt-1">Generate documents from templates with complete tracking</p>
//           </div>
//         </div>
//       </div>

//       <div className="mb-6">
//         <div className="flex items-center justify-center gap-4">
//           <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
//               step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
//             }`}>
//               1
//             </div>
//             <span className="font-bold">Select Template</span>
//           </div>
//           <ChevronRight className="w-5 h-5 text-gray-400" />
//           <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
//               step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
//             }`}>
//               2
//             </div>
//             <span className="font-bold">Fill Details</span>
//           </div>
//           <ChevronRight className="w-5 h-5 text-gray-400" />
//           <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>
//             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
//               step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-300 text-gray-600'
//             }`}>
//               3
//             </div>
//             <span className="font-bold">Settings & Save</span>
//           </div>
//         </div>
//       </div>

//       {step === 1 && (
//         <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
//           <div className="mb-6">
//             <h2 className="text-xl font-black text-gray-900 mb-4">Select a Template</h2>

//             <div className="flex flex-col md:flex-row gap-4 mb-6">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search templates by name, category, or description..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                 />
//               </div>

//               <div className="relative min-w-[200px]">
//                 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
//                 >
//                   {categories.map(category => (
//                     <option key={category} value={category}>{category}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {filteredTemplates.length > 0 && (
//               <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
//                 <span className="font-medium">
//                   Showing {filteredTemplates.length} of {templates.length} templates
//                 </span>
//                 {(searchTerm || selectedCategory !== 'All') && (
//                   <button
//                     onClick={() => {
//                       setSearchTerm('');
//                       setSelectedCategory('All');
//                     }}
//                     className="text-purple-600 hover:text-purple-700 font-semibold"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           {templates.length === 0 ? (
//             <div className="text-center py-12">
//               <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-600 font-semibold">No templates available</p>
//               <p className="text-gray-500 text-sm mt-2">Please create templates first from Template Manager</p>
//             </div>
//           ) : filteredTemplates.length === 0 ? (
//             <div className="text-center py-12">
//               <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-600 font-semibold">No templates found</p>
//               <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredTemplates.map(template => (
//                 <button
//                   key={template.id}
//                   onClick={() => handleTemplateSelect(template)}
//                   className="text-left p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
//                 >
//                   <div className="flex items-start gap-3">
//                     <FileText className="w-6 h-6 text-purple-600 flex-shrink-0" />
//                     <div>
//                       <h3 className="font-black text-gray-900 mb-1">{template.name}</h3>
//                       <p className="text-sm text-gray-600 mb-2">{template.description}</p>
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
//                           {template.category}
//                         </span>
//                         <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
//                           v{template.version}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {step === 2 && selectedTemplate && (
//         <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-black text-gray-900">Fill Document Details</h2>
//             <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
//               {selectedTemplate.name}
//             </span>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             {selectedTemplate.variables
//               .filter(v => v !== 'document_number')
//               .map(variable => (
//               <div key={variable}>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   {getFieldLabel(variable)}
//                   {variable.includes('tenant') && (variable.includes('name') || variable.includes('phone')) ? (
//                     <span className="text-red-500 ml-1">*</span>
//                   ) : null}
//                 </label>
//                 <input
//                   type={getFieldType(variable)}
//                   value={formData[variable] || ''}
//                   onChange={(e) => setFormData({ ...formData, [variable]: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
//                   placeholder={`Enter ${getFieldLabel(variable).toLowerCase()}`}
//                 />
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-between pt-4 border-t-2 border-gray-200">
//             <button
//               onClick={() => {
//                 setStep(1);
//                 setSelectedTemplate(null);
//               }}
//               className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               Back
//             </button>
//             <div className="flex gap-3">
//               <button
//                 onClick={generatePreview}
//                 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
//               >
//                 <Eye className="w-5 h-5" />
//                 Preview
//               </button>
//               <button
//                 onClick={() => setStep(3)}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
//               >
//                 Next
//                 <ChevronRight className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {step === 3 && selectedTemplate && (
//         <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-black text-gray-900">Document Settings & Options</h2>
//             <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
//               {selectedTemplate.name}
//             </span>
//           </div>

//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
//                 <div className="flex items-center gap-3 mb-3">
//                   <FileSignature className="w-5 h-5 text-blue-600" />
//                   <label className="flex items-center gap-2 font-bold text-gray-900">
//                     <input
//                       type="checkbox"
//                       checked={documentSettings.signatureRequired}
//                       onChange={(e) => setDocumentSettings({ ...documentSettings, signatureRequired: e.target.checked })}
//                       className="w-5 h-5 rounded border-gray-300"
//                     />
//                     Signature Required
//                   </label>
//                 </div>
//                 <p className="text-sm text-gray-600 ml-8">Document requires tenant signature before completion</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
//                   <AlertCircle className="w-4 h-4 text-orange-600" />
//                   Priority Level
//                 </label>
//                 <select
//                   value={documentSettings.priority}
//                   onChange={(e) => setDocumentSettings({ ...documentSettings, priority: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
//                 >
//                   <option value="low">Low Priority</option>
//                   <option value="normal">Normal Priority</option>
//                   <option value="high">High Priority</option>
//                   <option value="urgent">Urgent</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
//                   <Clock className="w-4 h-4 text-green-600" />
//                   Expiry Date (Optional)
//                 </label>
//                 <input
//                   type="date"
//                   value={documentSettings.expiryDate}
//                   onChange={(e) => setDocumentSettings({ ...documentSettings, expiryDate: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
//                   min={new Date().toISOString().split('T')[0]}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">Set an expiry date for time-sensitive documents</p>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
//                   <Share2 className="w-4 h-4 text-purple-600" />
//                   Tags (Optional)
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     onKeyPress={(e) => {
//                       if (e.key === 'Enter') {
//                         addTag((e.target as HTMLInputElement).value);
//                         (e.target as HTMLInputElement).value = '';
//                       }
//                     }}
//                     className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
//                     placeholder="Press Enter to add tag"
//                   />
//                 </div>
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {documentSettings.tags.map(tag => (
//                     <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
//                       {tag}
//                       <button onClick={() => removeTag(tag)} className="hover:text-purple-900">
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes (Optional)</label>
//               <textarea
//                 value={documentSettings.notes}
//                 onChange={(e) => setDocumentSettings({ ...documentSettings, notes: e.target.value })}
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all font-semibold"
//                 rows={3}
//                 placeholder="Add any additional notes or instructions"
//               />
//             </div>

//             <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
//                 <div>
//                   <h3 className="font-bold text-green-900 mb-2">Document Summary</h3>
//                   <div className="grid grid-cols-2 gap-3 text-sm">
//                     <div><span className="font-bold">Template:</span> {selectedTemplate.name}</div>
//                     <div><span className="font-bold">Tenant:</span> {formData.tenant_name || 'N/A'}</div>
//                     <div><span className="font-bold">Phone:</span> {formData.tenant_phone || 'N/A'}</div>
//                     <div><span className="font-bold">Priority:</span> {documentSettings.priority.toUpperCase()}</div>
//                     <div><span className="font-bold">Signature:</span> {documentSettings.signatureRequired ? 'Required' : 'Not Required'}</div>
//                     <div><span className="font-bold">Expiry:</span> {documentSettings.expiryDate || 'No expiry'}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-between pt-6 border-t-2 border-gray-200 mt-6">
//             <button
//               onClick={() => setStep(2)}
//               className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
//             >
//               <ChevronLeft className="w-5 h-5" />
//               Back
//             </button>
//             <div className="flex gap-3">
//               <button
//                 onClick={generatePreview}
//                 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
//               >
//                 <Eye className="w-5 h-5" />
//                 Preview
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving}
//                 className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
//               >
//                 {saving ? (
//                   <>Creating...</>
//                 ) : (
//                   <>
//                     <Save className="w-5 h-5" />
//                     Create Document
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showPreview && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
//             <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl z-10">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-black text-white">Document Preview</h2>
//                 <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// DocumentCreate.tsx
// Theme: blue/indigo compact — same as TemplateManager & TenantHandover
// Tenant fetch: getTenant(id) -> /api/tenants/:id -> ALL fields auto-filled
// DocumentCreate.tsx
// Tenant fetch: uses tenantDetailsApi.getProfileById(id)  ← EXACTLY like TenantHandover
// Fetches: property_name, room_number, bed_number, move_in_date(check_in_date),
//          rent_amount(monthly_rent / rent_per_bed), security_deposit(from property),
//          emergency_contact_name, emergency_contact_phone
// Removed: document_title field from form






// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import {
//   FileText, Eye, Save, X, ChevronLeft, ChevronRight,
//   Clock, CheckCircle, AlertCircle, Search, User, Phone,
//   Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
//   LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee,
// } from "lucide-react";
// import { Input }  from "@/components/ui/input";
// import { Badge }  from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";

// import { listTemplates, getTemplate, type DocumentTemplate } from "@/lib/documentTemplateApi";
// import { listTenants }                                        from "@/lib/tenantApi";
// // ── KEY: same import as TenantHandover ───────────────────────────────────────
// import { tenantDetailsApi }                                   from "@/lib/tenantDetailsApi";
// import { getProperty }                                        from "@/lib/propertyApi";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// // ── Style tokens (same as TemplateManager & TenantHandover) ──────────────────
// const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L  = "block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ label, value, icon: Icon, accent }: any) => (
//   <Card className="border-0 shadow-sm bg-white">
//     <CardContent className="p-2.5 flex items-center gap-2">
//       <div className={`p-1.5 rounded-lg ${accent}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
//       <div>
//         <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
//         <p className="text-xs font-bold text-gray-800">{value}</p>
//       </div>
//     </CardContent>
//   </Card>
// );

// const StepDot = ({ n, label, cur, done }: { n: number; label: string; cur: number; done: boolean }) => (
//   <div className="flex items-center gap-1.5 flex-shrink-0">
//     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
//       ${cur === n ? "bg-blue-600 text-white shadow-md shadow-blue-200" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
//       {done ? <Check className="h-3 w-3" /> : n}
//     </div>
//     <span className={`text-[11px] font-semibold hidden sm:inline
//       ${cur === n ? "text-blue-700" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
//   </div>
// );

// // ── Constants ─────────────────────────────────────────────────────────────────
// const TPL_CATS = [
//   "All","Agreements","Rental Agreements","KYC Documents","Onboarding Documents",
//   "Financial Documents","Policy Documents","Exit Documents","Inspection Forms","Declarations","Other",
// ];
// const PRIORITY_OPTS = [
//   { value:"low",    label:"Low",    cls:"bg-gray-100 text-gray-600" },
//   { value:"normal", label:"Normal", cls:"bg-blue-100 text-blue-700" },
//   { value:"high",   label:"High",   cls:"bg-orange-100 text-orange-700" },
//   { value:"urgent", label:"Urgent", cls:"bg-red-100 text-red-700" },
// ];

// // ── Fields to show per group (document_title REMOVED) ─────────────────────────
// const GROUP_SYSTEM   = ["document_type","date"];
// const GROUP_TENANT   = ["tenant_name","tenant_phone","tenant_email","aadhaar_number","pan_number","emergency_contact_name","emergency_phone"];
// const GROUP_PROPERTY = ["property_name","company_name","company_address","room_number","bed_number","move_in_date","rent_amount","security_deposit","payment_mode"];
// const ALL_GROUPED    = [...GROUP_SYSTEM, ...GROUP_TENANT, ...GROUP_PROPERTY];

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const safeNum  = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
// const money    = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

// // ── toInputDate: same as TenantHandover ───────────────────────────────────────
// const toInputDate = (d: string | undefined | null): string => {
//   if (!d) return "";
//   if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
//   try {
//     const dt = new Date(d);
//     return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
//   } catch { return ""; }
// };

// const fmtDateLong = (d?: string | null) => {
//   if (!d) return "";
//   try {
//     const dt = new Date(d);
//     return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
//   } catch { return ""; }
// };

// const todayStr = () =>
//   new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

// const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// const getFieldType = (k: string) => {
//   if (k.includes("date"))   return "date";
//   if (k.includes("email"))  return "email";
//   if (k.includes("phone"))  return "tel";
//   if (["amount","deposit","rent"].some(x => k.includes(x))) return "number";
//   return "text";
// };
// const getFieldLabel = (k: string) =>
//   k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// const renderHtml = (html: string, data: Record<string, string>, logoSrc?: string) => {
//   let out = html;
//   out = logoSrc
//     ? out.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`)
//     : out.replace(/\{\{logo_url\}\}/g, "");
//   Object.entries(data).forEach(([k, v]) => {
//     out = out.replace(new RegExp(`\\{\\{${escRe(k)}\\}\\}`, "g"), v || "");
//   });
//   return out.replace(/\{\{[\w_]+\}\}/g, "—");
// };

// // ── FieldInput ────────────────────────────────────────────────────────────────
// function FieldInput({ variable, formData, setFormData, required = false }: {
//   variable: string;
//   formData: Record<string, string>;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
//   required?: boolean;
// }) {
//   // FIX: always convert to string — prevents "trim is not a function" when value is number/null/undefined
//   const raw    = formData[variable];
//   const strVal = raw != null ? String(raw) : "";
//   const filled = !!strVal.trim();

//   return (
//     <div>
//       <label className={L}>
//         {getFieldLabel(variable)}{required && <span className="text-red-400 ml-0.5">*</span>}
//       </label>
//       <input
//         type={getFieldType(variable)}
//         value={strVal}
//         onChange={e => setFormData(p => ({ ...p, [variable]: e.target.value }))}
//         placeholder={getFieldLabel(variable)}
//         className={`w-full h-8 px-2.5 text-[11px] border rounded-md transition-all font-medium outline-none
//           ${filled
//             ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
//             : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
//       />
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════════════════
// export function DocumentCreate() {
//   // Templates
//   const [templates,      setTemplates]      = useState<DocumentTemplate[]>([]);
//   const [filteredTpls,   setFilteredTpls]   = useState<DocumentTemplate[]>([]);
//   const [selTemplate,    setSelTemplate]    = useState<DocumentTemplate | null>(null);
//   const [loadingTpls,    setLoadingTpls]    = useState(true);
//   const [tplSearch,      setTplSearch]      = useState("");
//   const [catFilter,      setCatFilter]      = useState("All");

//   // Tenants
//   const [tenantList,     setTenantList]     = useState<any[]>([]);
//   const [tenantSearch,   setTenantSearch]   = useState("");
//   const [loadingTenants, setLoadingTenants] = useState(false);
//   const [selTenant,      setSelTenant]      = useState<any | null>(null);
//   const [fetchingDetail, setFetchingDetail] = useState(false);

//   const [step,        setStep]        = useState(1);
//   const [formData,    setFormData]    = useState<Record<string, string>>({});
//   const [previewHtml, setPreviewHtml] = useState("");
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving,      setSaving]      = useState(false);

//   const [settings, setSettings] = useState({
//     signatureRequired: false, priority: "normal",
//     expiryDate: "", tags: [] as string[], notes: "",
//   });
//   const tagRef = useRef<HTMLInputElement>(null);

//   const stats = useMemo(() => ({
//     total:  templates.length,
//     active: templates.filter(t => t.is_active).length,
//     cats:   new Set(templates.map(t => t.category)).size,
//   }), [templates]);

//   // ── Load templates ──────────────────────────────────────────────────────────
//   const loadTemplates = useCallback(async () => {
//     setLoadingTpls(true);
//     try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
//     catch { toast.error("Failed to load templates"); }
//     finally { setLoadingTpls(false); }
//   }, []);
//   useEffect(() => { loadTemplates(); }, [loadTemplates]);

//   // Filter templates
//   useEffect(() => {
//     let list = [...templates];
//     if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
//     if (tplSearch.trim()) {
//       const s = tplSearch.toLowerCase();
//       list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
//     }
//     setFilteredTpls(list);
//   }, [templates, tplSearch, catFilter]);

//   // ── Search tenants ──────────────────────────────────────────────────────────
//   const doSearch = useCallback(async (q: string) => {
//     setLoadingTenants(true);
//     try {
//       const res = await listTenants({ search: q || undefined, pageSize: 40, is_active: "true" });
//       setTenantList(res.data || []);
//     } catch { toast.error("Failed to search tenants"); }
//     finally { setLoadingTenants(false); }
//   }, []);
//   useEffect(() => {
//     if (step !== 2) return;
//     const t = setTimeout(() => doSearch(tenantSearch), 320);
//     return () => clearTimeout(t);
//   }, [tenantSearch, step, doSearch]);
//   useEffect(() => { if (step === 2) doSearch(""); }, [step, doSearch]);

//   // ── Step 1: select template ─────────────────────────────────────────────────
//   const handleTemplateSelect = async (tpl: DocumentTemplate) => {
//     let full = tpl;
//     if (!tpl.html_content) {
//       try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
//     }
//     setSelTemplate(full);
//     setStep(2);
//   };

//   // ── Step 2: select tenant — EXACTLY like TenantHandover ─────────────────────
//   // Uses tenantDetailsApi.getProfileById → /api/tenant-details/profile/:id
//   // Reads same fields: property_id, property_name, room_number, bed_number,
//   //                    check_in_date, monthly_rent, rent_per_bed,
//   //                    emergency_contact_name, emergency_contact_phone
//   const handleTenantSelect = async (t: any) => {
//     setSelTenant(t);
//     setFetchingDetail(true);

//     // Step 1: set basic info from list immediately
//     const base: Record<string, string> = {
//       date:            todayStr(),
//       document_number: "AUTO-GENERATED",
//       document_type:   selTemplate!.category,
//       tenant_name:     t.full_name || "",
//       tenant_phone:    t.phone     || "",
//       tenant_email:    t.email     || "",
//     };
//     // Initialise all template vars
//     (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });
//     setFormData(base);

//     try {
//       // ── KEY: getProfileById — same call as TenantHandover ──────────────────
//       const res = await tenantDetailsApi.getProfileById(String(t.id));
//       const d   = res?.data;
//       if (!d) throw new Error("No data");

//       // Fetch security deposit from property — same as TenantHandover
//       let secDeposit = 0;
//       if (d.property_id) {
//         try {
//           const propRes = await getProperty(String(d.property_id));
//           if (propRes?.success && propRes?.data) {
//             secDeposit = safeNum(propRes.data.security_deposit);
//           }
//         } catch { /* ignore */ }
//       }

//       // Map all fields — mirrors TenantHandover exactly
//       const mapped: Record<string, string> = {
//         date:                   todayStr(),
//         document_number:        "AUTO-GENERATED",
//         document_type:          selTemplate!.category,

//         // Personal
//         tenant_name:            d.full_name                  || t.full_name || "",
//         tenant_phone:           d.phone                      || t.phone     || "",
//         tenant_email:           d.email                      || t.email     || "",
//         aadhaar_number:         "",
//         pan_number:             "",
//         emergency_contact_name: d.emergency_contact_name     || "",
//         emergency_phone:        d.emergency_contact_phone    || "",

//         // Property — uses same fields as TenantHandover
//         property_name:          d.property_name              || "",
//         room_number:            d.room_number                || "",
//         bed_number:             d.bed_number != null         ? String(d.bed_number) : "",
//         // move_in_date as YYYY-MM-DD for date input (same toInputDate as TenantHandover)
//         move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
//         rent_amount:            d.monthly_rent != null       ? String(safeNum(d.monthly_rent))
//                                 : d.rent_per_bed != null     ? String(safeNum(d.rent_per_bed)) : "",
//         security_deposit:       secDeposit > 0               ? String(secDeposit) : "",
//         payment_mode:           "UPI / Bank Transfer",

//         // Company from property manager
//         company_name:           d.property_manager_name      || "",
//         company_address:        [d.property_address, d.property_city, d.property_state]
//                                   .filter(Boolean).join(", "),
//       };

//       // Fill remaining template vars
//       (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
//       setFormData(mapped);
//       toast.success(`✅ Auto-filled from ${d.full_name || t.full_name}`);
//     } catch {
//       // Fallback: use list-level data
//       const fallback: Record<string, string> = {
//         date:            todayStr(),
//         document_number: "AUTO-GENERATED",
//         document_type:   selTemplate!.category,
//         tenant_name:     t.full_name || "",
//         tenant_phone:    t.phone     || "",
//         tenant_email:    t.email     || "",
//         property_name:   t.property_name || t.assigned_property_name || "",
//         room_number:     t.room_number   || t.assigned_room_number   || "",
//         bed_number:      t.bed_number != null ? String(t.bed_number) : "",
//         rent_amount:     t.monthly_rent ? String(safeNum(t.monthly_rent)) : "",
//         security_deposit:"",
//         payment_mode:    "UPI / Bank Transfer",
//         company_name:    "",
//         company_address: "",
//         emergency_contact_name: "",
//         emergency_phone: "",
//         aadhaar_number:  "",
//         pan_number:      "",
//       };
//       (selTemplate!.variables || []).forEach(v => { if (!(v in fallback)) fallback[v] = ""; });
//       setFormData(fallback);
//       toast.info("Basic info filled — some fields may need manual entry");
//     } finally {
//       setFetchingDetail(false);
//       setStep(3);
//     }
//   };

//   const skipTenant = () => {
//     setSelTenant(null);
//     const empty: Record<string, string> = {
//       date:            todayStr(),
//       document_number: "AUTO-GENERATED",
//       document_type:   selTemplate!.category,
//     };
//     (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
//     setFormData(empty);
//     setStep(3);
//   };

//   // ── Preview ─────────────────────────────────────────────────────────────────
//   const generatePreview = () => {
//     if (!selTemplate?.html_content) return;
//     const logo = selTemplate.logo_url
//       ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
//       : "";
//     setPreviewHtml(renderHtml(selTemplate.html_content, formData, logo));
//     setShowPreview(true);
//   };

//   const handlePrint = () => {
//     const w = window.open("", "_blank");
//     if (w) {
//       w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`);
//       w.document.close(); w.focus(); w.print();
//     }
//   };

//   // ── Save ────────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!formData.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
//     if (!formData.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }
//     setSaving(true);
//     try {
//       const token    = localStorage.getItem("admin_token");
//       const logo     = selTemplate!.logo_url
//         ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
//         : "";
//       const finalHtml = renderHtml(selTemplate!.html_content, formData, logo);

//       const res = await fetch(`${API_BASE}/api/documents`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({
//           template_id:        selTemplate!.id,
//           document_name:      selTemplate!.name,
//           tenant_id:          selTenant?.id     || null,
//           tenant_name:        formData.tenant_name,
//           tenant_phone:       formData.tenant_phone,
//           tenant_email:       formData.tenant_email   || null,
//           property_name:      formData.property_name  || null,
//           room_number:        formData.room_number     || null,
//           html_content:       finalHtml,
//           data_json:          formData,
//           status:             "Created",
//           created_by:         "Admin",
//           signature_required: settings.signatureRequired,
//           priority:           settings.priority,
//           expiry_date:        settings.expiryDate || null,
//           tags:               settings.tags,
//           notes:              settings.notes      || null,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed");
//       toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
//       setStep(1); setSelTemplate(null); setSelTenant(null); setFormData({});
//       setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
//     } catch (e: any) { toast.error(e.message || "Failed to create document"); }
//     finally { setSaving(false); }
//   };

//   const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
//   const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

//   // Visible vars — exclude document_number, logo_url, AND document_title
//   const visibleVars = useMemo(() =>
//     (selTemplate?.variables || []).filter(v =>
//       !["document_number","logo_url","document_title"].includes(v)
//     ), [selTemplate]);

//   // ════════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="bg-gray-50 min-h-full">

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-16 z-10 pb-2">
//         <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
//           <div className="flex items-center gap-1.5 min-w-0">
//             {selTemplate && (
//               <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
//                 <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
//                 <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
//                 {selTenant && (
//                   <><ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
//                   <User className="h-3 w-3 text-green-500 flex-shrink-0" />
//                   <span className="font-semibold text-green-700 truncate max-w-[100px]">{selTenant.full_name}</span></>
//                 )}
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             <button onClick={loadTemplates} disabled={loadingTpls}
//               className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
//               <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
//             </button>
//             {step > 1 && (
//               <button onClick={() => { setStep(1); setSelTemplate(null); setSelTenant(null); }}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium shadow-sm">
//                 <X className="h-3.5 w-3.5" />Start Over
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-1.5 mb-2">
//           <StatCard label="Templates"  value={stats.total}  icon={LayoutTemplate} accent="bg-blue-600" />
//           <StatCard label="Active"     value={stats.active} icon={CheckCircle}    accent="bg-green-500" />
//           <StatCard label="Categories" value={stats.cats}   icon={Tag}            accent="bg-indigo-600" />
//         </div>

//         {/* Steps */}
//         <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
//           {["Select Template","Select Tenant","Fill Details","Settings & Save"].map((label, i) => (
//             <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
//               <StepDot n={i+1} label={label} cur={step} done={step > i+1} />
//               {i < 3 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ══ STEP 1: Templates ══ */}
//       {step === 1 && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <LayoutTemplate className="h-4 w-4 text-blue-600" />Choose Template ({filteredTpls.length})
//             </span>
//             {(tplSearch || catFilter !== "All") && (
//               <button onClick={() => { setTplSearch(""); setCatFilter("All"); }} className="text-[10px] text-blue-600 font-semibold">Clear</button>
//             )}
//           </div>
//           <div className="px-3 py-2 border-b bg-gray-50/50 flex gap-2">
//             <div className="flex-1 relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Search templates…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} className="h-8 pl-8 text-[11px] bg-white border-gray-200" />
//             </div>
//             <Select value={catFilter} onValueChange={setCatFilter}>
//               <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
//               <SelectContent>{TPL_CATS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
//             {loadingTpls ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
//             ) : filteredTpls.length === 0 ? (
//               <div className="text-center py-12"><LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No templates found</p></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
//                 {filteredTpls.map(t => (
//                   <button key={t.id} onClick={() => handleTemplateSelect(t)}
//                     className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
//                     {t.is_active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />}
//                     <div className="flex items-start gap-2 mb-2">
//                       {t.logo_url ? (
//                         <img src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`} alt=""
//                           className="h-7 w-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
//                           onError={e => (e.currentTarget.style.display = "none")} />
//                       ) : (
//                         <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
//                           <FileText className="h-3.5 w-3.5 text-blue-500" />
//                         </div>
//                       )}
//                       <p className="text-[11px] font-black text-gray-800 group-hover:text-blue-700 leading-tight line-clamp-2">{t.name}</p>
//                     </div>
//                     <div className="flex items-center gap-1.5 flex-wrap">
//                       <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0">{t.category}</Badge>
//                       <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] px-1.5 py-0">v{t.version}</Badge>
//                       <span className="text-[9px] text-gray-400 ml-auto">{t.variables?.length || 0} vars</span>
//                     </div>
//                     {t.description && <p className="text-[9px] text-gray-400 mt-1.5 line-clamp-1">{t.description}</p>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 2: Select Tenant ══ */}
//       {step === 2 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <User className="h-4 w-4 text-green-600" />Select Tenant — auto-fills all details
//             </span>
//             <div className="flex items-center gap-2">
//               {fetchingDetail && <div className="flex items-center gap-1 text-[11px] text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" />Fetching…</div>}
//               <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
//             </div>
//           </div>
//           <div className="px-3 py-2 border-b bg-gray-50/50">
//             <div className="relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Search by name, phone, email…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}
//                 className="h-8 pl-8 text-[11px] bg-white border-gray-200" autoFocus />
//             </div>
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 330px)", overflowY:"auto" }}>
//             {loadingTenants ? (
//               <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
//             ) : tenantList.length === 0 ? (
//               <div className="text-center py-10"><User className="h-9 w-9 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No tenants found</p></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                 {tenantList.map(t => (
//                   <button key={t.id} onClick={() => handleTenantSelect(t)} disabled={fetchingDetail}
//                     className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group disabled:opacity-60">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-sm">
//                         {(t.full_name || "?").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-[11px] font-black text-gray-800 group-hover:text-green-700 truncate">{t.full_name}</p>
//                         {(t.property_name || t.assigned_property_name) && (
//                           <p className="text-[9px] text-gray-400 flex items-center gap-1 truncate">
//                             <Building2 className="h-2.5 w-2.5 flex-shrink-0" />{t.property_name || t.assigned_property_name}
//                           </p>
//                         )}
//                       </div>
//                       {(t.room_number || t.assigned_room_number) && (
//                         <Badge className="bg-green-50 text-green-700 border border-green-200 text-[9px] px-1.5 py-0 flex-shrink-0">
//                           R-{t.room_number || t.assigned_room_number}
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="space-y-0.5">
//                       {t.phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-gray-400" />{t.phone}</p>}
//                       {t.email && <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5 text-gray-400" />{t.email}</p>}
//                       {(t.monthly_rent || t.rent_per_bed) && (
//                         <p className="text-[10px] text-gray-500 flex items-center gap-1">
//                           <IndianRupee className="h-2.5 w-2.5 text-gray-400" />{money(t.monthly_rent || t.rent_per_bed)}/mo
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg">
//             <button onClick={() => { setStep(1); setSelTemplate(null); }}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />Back
//             </button>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 3: Fill Details ══ */}
//       {step === 3 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <FileText className="h-4 w-4 text-blue-600" />Document Details
//             </span>
//             {selTenant && (
//               <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
//                 <UserCheck className="h-3 w-3 text-green-600" />
//                 <span className="text-[10px] font-semibold text-green-700">{selTenant.full_name}</span>
//                 <button onClick={() => setStep(2)} className="text-[9px] text-green-500 hover:underline ml-1">change</button>
//               </div>
//             )}
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 270px)", overflowY:"auto" }}>

//             {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_TENANT.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData}
//                       required={["tenant_name","tenant_phone"].includes(v)} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {GROUP_PROPERTY.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<Building2 className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_PROPERTY.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {(() => {
//               const rest = visibleVars.filter(v => !ALL_GROUPED.includes(v));
//               if (!rest.length) return null;
//               return (
//                 <div className="mb-4">
//                   <SH icon={<Hash className="h-3 w-3" />} title="Other Fields" color="text-gray-500" />
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                     {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
//                   </div>
//                 </div>
//               );
//             })()}

//             {selTenant && (
//               <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
//                 <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-[10px] text-blue-700">
//                   Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's full profile —
//                   property, room, bed, move-in date, rent, security deposit, emergency contact, company info.
//                 </p>
//               </div>
//             )}
//           </div>
//           <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
//             <button onClick={() => setStep(2)}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />Back
//             </button>
//             <div className="flex gap-2">
//               <button onClick={generatePreview}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
//                 <Eye className="h-3.5 w-3.5" />Preview
//               </button>
//               <button onClick={() => setStep(4)}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
//                 Next<ChevronRight className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 4: Settings ══ */}
//       {step === 4 && selTemplate && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
//           <div className="lg:col-span-2">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-white rounded-t-lg">
//                 <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
//                   <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
//                 </span>
//               </div>
//               <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.signatureRequired ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
//                   onClick={() => setSettings(p => ({ ...p, signatureRequired:!p.signatureRequired }))}>
//                   <div className="flex items-center gap-2">
//                     <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${settings.signatureRequired ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
//                       {settings.signatureRequired && <Check className="h-3 w-3 text-white" />}
//                     </div>
//                     <div>
//                       <p className="text-[11px] font-black text-gray-800">Signature Required</p>
//                       <p className="text-[9px] text-gray-500">Tenant must sign to complete</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><AlertCircle className="h-3 w-3 inline mr-1" />Priority</label>
//                   <div className="flex gap-1.5 flex-wrap">
//                     {PRIORITY_OPTS.map(o => (
//                       <button key={o.value} onClick={() => setSettings(p => ({ ...p, priority:o.value }))}
//                         className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all
//                           ${settings.priority === o.value ? "border-blue-500 bg-blue-600 text-white shadow-sm" : `${o.cls} border-transparent hover:border-gray-300`}`}>
//                         {o.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><Clock className="h-3 w-3 inline mr-1" />Expiry Date</label>
//                   <Input type="date" value={settings.expiryDate} onChange={e => setSettings(p => ({...p, expiryDate:e.target.value}))}
//                     min={new Date().toISOString().split("T")[0]} className={`${F} w-full`} />
//                 </div>
//                 <div>
//                   <label className={L}><Tag className="h-3 w-3 inline mr-1" />Tags</label>
//                   <Input ref={tagRef} placeholder="Press Enter to add…"
//                     onKeyDown={e => { if (e.key === "Enter" && tagRef.current) { addTag(tagRef.current.value); tagRef.current.value = ""; } }}
//                     className={`${F} w-full`} />
//                   <div className="flex flex-wrap gap-1 mt-1.5">
//                     {settings.tags.map(tag => (
//                       <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold flex items-center gap-1 border border-blue-200">
//                         {tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="px-3 pb-3">
//                 <label className={L}>Notes</label>
//                 <textarea value={settings.notes} onChange={e => setSettings(p => ({...p, notes:e.target.value}))} rows={2}
//                   className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 focus:bg-white resize-none transition-all"
//                   placeholder="Any additional instructions…" />
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-3">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
//                 <span className="text-xs font-semibold text-white flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" />Document Summary</span>
//               </div>
//               <div className="p-3 space-y-2">
//                 {[
//                   ["Template",  selTemplate.name,                               "text-blue-700"],
//                   ["Tenant",    formData.tenant_name        || "—",             "text-gray-800"],
//                   ["Phone",     formData.tenant_phone       || "—",             "text-gray-600"],
//                   ["Property",  formData.property_name      || "—",             "text-gray-600"],
//                   ["Room",      formData.room_number        || "—",             "text-gray-600"],
//                   ["Bed",       formData.bed_number         || "—",             "text-gray-600"],
//                   ["Move-In",   formData.move_in_date       || "—",             "text-gray-600"],
//                   ["Rent",      formData.rent_amount        ? money(formData.rent_amount)     : "—", "text-green-700"],
//                   ["Deposit",   formData.security_deposit   ? money(formData.security_deposit): "—", "text-green-700"],
//                   ["Emergency", formData.emergency_contact_name || "—",         "text-gray-600"],
//                   ["Company",   formData.company_name       || "—",             "text-gray-600"],
//                   ["Priority",  settings.priority.toUpperCase(),                "text-orange-600"],
//                   ["Signature", settings.signatureRequired  ? "Required":"Not Required",
//                                 settings.signatureRequired  ? "text-blue-600":"text-gray-500"],
//                 ].map(([k,v,cls]) => (
//                   <div key={k} className="flex items-start justify-between gap-2">
//                     <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
//                     <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//             <div className="space-y-2">
//               <button onClick={generatePreview}
//                 className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
//                 <Eye className="h-3.5 w-3.5" />Preview Document
//               </button>
//               <button onClick={handleSave} disabled={saving}
//                 className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50">
//                 {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating…</> : <><Save className="h-3.5 w-3.5" />Create Document</>}
//               </button>
//               <button onClick={() => setStep(3)}
//                 className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//                 <ChevronLeft className="h-3 w-3" />Back to Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ PREVIEW MODAL ══ */}
//       {showPreview && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight:"92vh" }}>
//             <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Eye className="h-4 w-4 text-white" />
//                 <span className="text-sm font-semibold text-white">Document Preview</span>
//                 <Badge className="bg-white/20 text-white border-0 text-[10px]">Live Data</Badge>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
//                 <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
//               <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
//                 <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
//               </div>
//             </div>
//             <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
//               <button onClick={handlePrint}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
//                 <Printer className="h-3.5 w-3.5" />Print
//               </button>
//               <button onClick={() => setShowPreview(false)}
//                 className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



// DocumentCreate.tsx
// Tenant fetch: uses tenantDetailsApi.getProfileById(id)  ← EXACTLY like TenantHandover
// Fetches: property_name, room_number, bed_number, move_in_date(check_in_date),
//          rent_amount(monthly_rent / rent_per_bed), security_deposit(from property),
//          emergency_contact_name, emergency_contact_phone
// Removed: document_title field from form

// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import {
//   FileText, Eye, Save, X, ChevronLeft, ChevronRight,
//   Clock, CheckCircle, AlertCircle, Search, User, Phone,
//   Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
//   LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee,
// } from "lucide-react";
// import { Input }  from "@/components/ui/input";
// import { Badge }  from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import { toast } from "sonner";

// import { listTemplates, getTemplate, type DocumentTemplate } from "@/lib/documentTemplateApi";
// import { listTenants }                                        from "@/lib/tenantApi";
// // ── KEY: same import as TenantHandover ───────────────────────────────────────
// import { tenantDetailsApi }                                   from "@/lib/tenantDetailsApi";
// import { getProperty }                                        from "@/lib/propertyApi";

// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// // ── Style tokens (same as TemplateManager & TenantHandover) ──────────────────
// const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L  = "block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ label, value, icon: Icon, accent }: any) => (
//   <Card className="border-0 shadow-sm bg-white">
//     <CardContent className="p-2.5 flex items-center gap-2">
//       <div className={`p-1.5 rounded-lg ${accent}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
//       <div>
//         <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
//         <p className="text-xs font-bold text-gray-800">{value}</p>
//       </div>
//     </CardContent>
//   </Card>
// );

// const StepDot = ({ n, label, cur, done }: { n: number; label: string; cur: number; done: boolean }) => (
//   <div className="flex items-center gap-1.5 flex-shrink-0">
//     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
//       ${cur === n ? "bg-blue-600 text-white shadow-md shadow-blue-200" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
//       {done ? <Check className="h-3 w-3" /> : n}
//     </div>
//     <span className={`text-[11px] font-semibold hidden sm:inline
//       ${cur === n ? "text-blue-700" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
//   </div>
// );

// // ── Constants ─────────────────────────────────────────────────────────────────
// const TPL_CATS = [
//   "All","Agreements","Rental Agreements","KYC Documents","Onboarding Documents",
//   "Financial Documents","Policy Documents","Exit Documents","Inspection Forms","Declarations","Other",
// ];
// const PRIORITY_OPTS = [
//   { value:"low",    label:"Low",    cls:"bg-gray-100 text-gray-600" },
//   { value:"normal", label:"Normal", cls:"bg-blue-100 text-blue-700" },
//   { value:"high",   label:"High",   cls:"bg-orange-100 text-orange-700" },
//   { value:"urgent", label:"Urgent", cls:"bg-red-100 text-red-700" },
// ];

// // ── Fields per group ─────────────────────────────────────────────────────────
// // company_name, company_address → shown in form, admin fills manually
// // document_number, document_title → hidden (auto/hardcoded)
// const HIDDEN_VARS    = ["document_number","logo_url","document_title"];
// const GROUP_SYSTEM   = ["document_type","date"];
// const GROUP_TENANT   = ["tenant_name","tenant_phone","tenant_email","aadhaar_number","pan_number","emergency_contact_name","emergency_phone"];
// const GROUP_PROPERTY = ["property_name","room_number","bed_number","move_in_date","rent_amount","security_deposit","payment_mode"];
// const GROUP_COMPANY  = ["company_name","company_address"];
// const ALL_GROUPED    = [...GROUP_SYSTEM, ...GROUP_TENANT, ...GROUP_PROPERTY, ...GROUP_COMPANY];

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const safeNum  = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
// const money    = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

// // ── toInputDate: same as TenantHandover ───────────────────────────────────────
// const toInputDate = (d: string | undefined | null): string => {
//   if (!d) return "";
//   if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
//   try {
//     const dt = new Date(d);
//     return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
//   } catch { return ""; }
// };

// const fmtDateLong = (d?: string | null) => {
//   if (!d) return "";
//   try {
//     const dt = new Date(d);
//     return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
//   } catch { return ""; }
// };

// const todayStr = () =>
//   new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

// const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// const getFieldType = (k: string) => {
//   if (k.includes("date"))   return "date";
//   if (k.includes("email"))  return "email";
//   if (k.includes("phone"))  return "tel";
//   if (["amount","deposit","rent"].some(x => k.includes(x))) return "number";
//   return "text";
// };
// const getFieldLabel = (k: string) =>
//   k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// const renderHtml = (html: string, data: Record<string, string>, logoSrc?: string) => {
//   let out = html;
//   out = logoSrc
//     ? out.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`)
//     : out.replace(/\{\{logo_url\}\}/g, "");
//   Object.entries(data).forEach(([k, v]) => {
//     out = out.replace(new RegExp(`\\{\\{${escRe(k)}\\}\\}`, "g"), v || "");
//   });
//   return out.replace(/\{\{[\w_]+\}\}/g, "—");
// };

// // ── FieldInput ────────────────────────────────────────────────────────────────
// function FieldInput({ variable, formData, setFormData, required = false }: {
//   variable: string;
//   formData: Record<string, string>;
//   setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
//   required?: boolean;
// }) {
//   // FIX: always convert to string — prevents "trim is not a function" when value is number/null/undefined
//   const raw    = formData[variable];
//   const strVal = raw != null ? String(raw) : "";
//   const filled = !!strVal.trim();

//   return (
//     <div>
//       <label className={L}>
//         {getFieldLabel(variable)}{required && <span className="text-red-400 ml-0.5">*</span>}
//       </label>
//       <input
//         type={getFieldType(variable)}
//         value={strVal}
//         onChange={e => setFormData(p => ({ ...p, [variable]: e.target.value }))}
//         placeholder={getFieldLabel(variable)}
//         className={`w-full h-8 px-2.5 text-[11px] border rounded-md transition-all font-medium outline-none
//           ${filled
//             ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
//             : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
//       />
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════════════════════
// export function DocumentCreate() {
//   // Templates
//   const [templates,      setTemplates]      = useState<DocumentTemplate[]>([]);
//   const [filteredTpls,   setFilteredTpls]   = useState<DocumentTemplate[]>([]);
//   const [selTemplate,    setSelTemplate]    = useState<DocumentTemplate | null>(null);
//   const [loadingTpls,    setLoadingTpls]    = useState(true);
//   const [tplSearch,      setTplSearch]      = useState("");
//   const [catFilter,      setCatFilter]      = useState("All");

//   // Tenants
//   const [tenantList,     setTenantList]     = useState<any[]>([]);
//   const [tenantSearch,   setTenantSearch]   = useState("");
//   const [loadingTenants, setLoadingTenants] = useState(false);
//   const [selTenant,      setSelTenant]      = useState<any | null>(null);
//   const [fetchingDetail, setFetchingDetail] = useState(false);

//   const [step,        setStep]        = useState(1);
//   const [formData,    setFormData]    = useState<Record<string, string>>({});
//   const [previewHtml, setPreviewHtml] = useState("");
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving,      setSaving]      = useState(false);

//   const [settings, setSettings] = useState({
//     signatureRequired: false, priority: "normal",
//     expiryDate: "", tags: [] as string[], notes: "",
//   });
//   const tagRef = useRef<HTMLInputElement>(null);

//   const stats = useMemo(() => ({
//     total:  templates.length,
//     active: templates.filter(t => t.is_active).length,
//     cats:   new Set(templates.map(t => t.category)).size,
//   }), [templates]);

//   // ── Load templates ──────────────────────────────────────────────────────────
//   const loadTemplates = useCallback(async () => {
//     setLoadingTpls(true);
//     try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
//     catch { toast.error("Failed to load templates"); }
//     finally { setLoadingTpls(false); }
//   }, []);
//   useEffect(() => { loadTemplates(); }, [loadTemplates]);

//   // Filter templates
//   useEffect(() => {
//     let list = [...templates];
//     if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
//     if (tplSearch.trim()) {
//       const s = tplSearch.toLowerCase();
//       list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
//     }
//     setFilteredTpls(list);
//   }, [templates, tplSearch, catFilter]);

//   // ── Search tenants ──────────────────────────────────────────────────────────
//   const doSearch = useCallback(async (q: string) => {
//     setLoadingTenants(true);
//     try {
//       const res = await listTenants({ search: q || undefined, pageSize: 40, is_active: "true" });
//       setTenantList(res.data || []);
//     } catch { toast.error("Failed to search tenants"); }
//     finally { setLoadingTenants(false); }
//   }, []);
//   useEffect(() => {
//     if (step !== 2) return;
//     const t = setTimeout(() => doSearch(tenantSearch), 320);
//     return () => clearTimeout(t);
//   }, [tenantSearch, step, doSearch]);
//   useEffect(() => { if (step === 2) doSearch(""); }, [step, doSearch]);

//   // ── Step 1: select template ─────────────────────────────────────────────────
//   const handleTemplateSelect = async (tpl: DocumentTemplate) => {
//     let full = tpl;
//     if (!tpl.html_content) {
//       try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
//     }
//     setSelTemplate(full);
//     setStep(2);
//   };

//   // ── Step 2: select tenant — EXACTLY like TenantHandover ─────────────────────
//   // Uses tenantDetailsApi.getProfileById → /api/tenant-details/profile/:id
//   // Reads same fields: property_id, property_name, room_number, bed_number,
//   //                    check_in_date, monthly_rent, rent_per_bed,
//   //                    emergency_contact_name, emergency_contact_phone
//   const handleTenantSelect = async (t: any) => {
//     setSelTenant(t);
//     setFetchingDetail(true);

//     // Step 1: set basic info from list immediately
//     const base: Record<string, string> = {
//       date:            todayStr(),
//       document_number: "AUTO-GENERATED",
//       document_type:   selTemplate!.category,
//       tenant_name:     t.full_name || "",
//       tenant_phone:    t.phone     || "",
//       tenant_email:    t.email     || "",
//     };
//     // Initialise all template vars
//     (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });
//     setFormData(base);

//     try {
//       // ── KEY: getProfileById — same call as TenantHandover ──────────────────
//       const res = await tenantDetailsApi.getProfileById(String(t.id));
//       const d   = res?.data;
//       if (!d) throw new Error("No data");

//       // Fetch security deposit from property — same as TenantHandover
//       let secDeposit = 0;
//       if (d.property_id) {
//         try {
//           const propRes = await getProperty(String(d.property_id));
//           if (propRes?.success && propRes?.data) {
//             secDeposit = safeNum(propRes.data.security_deposit);
//           }
//         } catch { /* ignore */ }
//       }

//       // Map all fields — mirrors TenantHandover exactly
//       const mapped: Record<string, string> = {
//         date:                   todayStr(),
//         document_number:        "AUTO-GENERATED",
//         document_type:          selTemplate!.category,

//         // Personal
//         tenant_name:            d.full_name                  || t.full_name || "",
//         tenant_phone:           d.phone                      || t.phone     || "",
//         tenant_email:           d.email                      || t.email     || "",
//         aadhaar_number:         "",
//         pan_number:             "",
//         emergency_contact_name: d.emergency_contact_name     || "",
//         emergency_phone:        d.emergency_contact_phone    || "",

//         // Property — uses same fields as TenantHandover
//         property_name:          d.property_name              || "",
//         room_number:            d.room_number                || "",
//         bed_number:             d.bed_number != null         ? String(d.bed_number) : "",
//         // move_in_date as YYYY-MM-DD for date input (same toInputDate as TenantHandover)
//         move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
//         rent_amount:            d.monthly_rent != null       ? String(safeNum(d.monthly_rent))
//                                 : d.rent_per_bed != null     ? String(safeNum(d.rent_per_bed)) : "",
//         security_deposit:       secDeposit > 0               ? String(secDeposit) : "",
//         payment_mode:           "UPI / Bank Transfer",

//         // Company — admin fills manually, do NOT auto-fill from tenant/property data
//         company_name:           "",
//         company_address:        "",
//       };

//       // Fill remaining template vars
//       (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
//       setFormData(mapped);
//       toast.success(`✅ Auto-filled from ${d.full_name || t.full_name}`);
//     } catch {
//       // Fallback: use list-level data
//       const fallback: Record<string, string> = {
//         date:            todayStr(),
//         document_number: "AUTO-GENERATED",
//         document_type:   selTemplate!.category,
//         tenant_name:     t.full_name || "",
//         tenant_phone:    t.phone     || "",
//         tenant_email:    t.email     || "",
//         property_name:   t.property_name || t.assigned_property_name || "",
//         room_number:     t.room_number   || t.assigned_room_number   || "",
//         bed_number:      t.bed_number != null ? String(t.bed_number) : "",
//         rent_amount:     t.monthly_rent ? String(safeNum(t.monthly_rent)) : "",
//         security_deposit:"",
//         payment_mode:    "UPI / Bank Transfer",
//         company_name:    "",
//         company_address: "",
//         emergency_contact_name: "",
//         emergency_phone: "",
//         aadhaar_number:  "",
//         pan_number:      "",
//       };
//       (selTemplate!.variables || []).forEach(v => { if (!(v in fallback)) fallback[v] = ""; });
//       setFormData(fallback);
//       toast.info("Basic info filled — some fields may need manual entry");
//     } finally {
//       setFetchingDetail(false);
//       setStep(3);
//     }
//   };

//   const skipTenant = () => {
//     setSelTenant(null);
//     const empty: Record<string, string> = {
//       date:            todayStr(),
//       document_number: "AUTO-GENERATED",
//       document_type:   selTemplate!.category,
//     };
//     (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
//     setFormData(empty);
//     setStep(3);
//   };

//   // ── Preview ─────────────────────────────────────────────────────────────────
//   const generatePreview = () => {
//     if (!selTemplate?.html_content) return;
//     const logo = selTemplate.logo_url
//       ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
//       : "";
//     setPreviewHtml(renderHtml(selTemplate.html_content, formData, logo));
//     setShowPreview(true);
//   };

//   const handlePrint = () => {
//     const w = window.open("", "_blank");
//     if (w) {
//       w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`);
//       w.document.close(); w.focus(); w.print();
//     }
//   };

//   // ── Save ────────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!formData.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
//     if (!formData.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }
//     setSaving(true);
//     try {
//       const token    = localStorage.getItem("admin_token");
//       const logo     = selTemplate!.logo_url
//         ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
//         : "";
//       const finalHtml = renderHtml(selTemplate!.html_content, formData, logo);

//       const res = await fetch(`${API_BASE}/api/documents`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({
//           template_id:        selTemplate!.id,
//           document_name:      selTemplate!.name,
//           tenant_id:          selTenant?.id     || null,
//           tenant_name:        formData.tenant_name,
//           tenant_phone:       formData.tenant_phone,
//           tenant_email:       formData.tenant_email   || null,
//           property_name:      formData.property_name  || null,
//           room_number:        formData.room_number     || null,
//           html_content:       finalHtml,
//           data_json:          formData,
//           status:             "Created",
//           created_by:         "Admin",
//           signature_required: settings.signatureRequired,
//           priority:           settings.priority,
//           expiry_date:        settings.expiryDate || null,
//           tags:               settings.tags,
//           notes:              settings.notes      || null,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Failed");
//       toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
//       setStep(1); setSelTemplate(null); setSelTenant(null); setFormData({});
//       setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
//     } catch (e: any) { toast.error(e.message || "Failed to create document"); }
//     finally { setSaving(false); }
//   };

//   const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
//   const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

//   // Visible vars — exclude auto-set fields (document_number, logo_url, document_title)
//   const visibleVars = useMemo(() =>
//     (selTemplate?.variables || []).filter(v => !HIDDEN_VARS.includes(v)),
//     [selTemplate]);

//   // ════════════════════════════════════════════════════════════════════════════
//   return (
//     <div className="bg-gray-50 min-h-full">

//       {/* ── STICKY HEADER ── */}
//       <div className="sticky top-16 z-10 pb-2">
//         <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
//           <div className="flex items-center gap-1.5 min-w-0">
//             {selTemplate && (
//               <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
//                 <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
//                 <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
//                 {selTenant && (
//                   <><ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
//                   <User className="h-3 w-3 text-green-500 flex-shrink-0" />
//                   <span className="font-semibold text-green-700 truncate max-w-[100px]">{selTenant.full_name}</span></>
//                 )}
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             <button onClick={loadTemplates} disabled={loadingTpls}
//               className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
//               <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
//             </button>
//             {step > 1 && (
//               <button onClick={() => { setStep(1); setSelTemplate(null); setSelTenant(null); }}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium shadow-sm">
//                 <X className="h-3.5 w-3.5" />Start Over
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-3 gap-1.5 mb-2">
//           <StatCard label="Templates"  value={stats.total}  icon={LayoutTemplate} accent="bg-blue-600" />
//           <StatCard label="Active"     value={stats.active} icon={CheckCircle}    accent="bg-green-500" />
//           <StatCard label="Categories" value={stats.cats}   icon={Tag}            accent="bg-indigo-600" />
//         </div>

//         {/* Steps */}
//         <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
//           {["Select Template","Select Tenant","Fill Details","Settings & Save"].map((label, i) => (
//             <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
//               <StepDot n={i+1} label={label} cur={step} done={step > i+1} />
//               {i < 3 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ══ STEP 1: Templates ══ */}
//       {step === 1 && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <LayoutTemplate className="h-4 w-4 text-blue-600" />Choose Template ({filteredTpls.length})
//             </span>
//             {(tplSearch || catFilter !== "All") && (
//               <button onClick={() => { setTplSearch(""); setCatFilter("All"); }} className="text-[10px] text-blue-600 font-semibold">Clear</button>
//             )}
//           </div>
//           <div className="px-3 py-2 border-b bg-gray-50/50 flex gap-2">
//             <div className="flex-1 relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Search templates…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} className="h-8 pl-8 text-[11px] bg-white border-gray-200" />
//             </div>
//             <Select value={catFilter} onValueChange={setCatFilter}>
//               <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
//               <SelectContent>{TPL_CATS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
//             </Select>
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
//             {loadingTpls ? (
//               <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
//             ) : filteredTpls.length === 0 ? (
//               <div className="text-center py-12"><LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No templates found</p></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
//                 {filteredTpls.map(t => (
//                   <button key={t.id} onClick={() => handleTemplateSelect(t)}
//                     className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
//                     {t.is_active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />}
//                     <div className="flex items-start gap-2 mb-2">
//                       {t.logo_url ? (
//                         <img src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`} alt=""
//                           className="h-7 w-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
//                           onError={e => (e.currentTarget.style.display = "none")} />
//                       ) : (
//                         <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
//                           <FileText className="h-3.5 w-3.5 text-blue-500" />
//                         </div>
//                       )}
//                       <p className="text-[11px] font-black text-gray-800 group-hover:text-blue-700 leading-tight line-clamp-2">{t.name}</p>
//                     </div>
//                     <div className="flex items-center gap-1.5 flex-wrap">
//                       <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0">{t.category}</Badge>
//                       <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] px-1.5 py-0">v{t.version}</Badge>
//                       <span className="text-[9px] text-gray-400 ml-auto">{t.variables?.length || 0} vars</span>
//                     </div>
//                     {t.description && <p className="text-[9px] text-gray-400 mt-1.5 line-clamp-1">{t.description}</p>}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 2: Select Tenant ══ */}
//       {step === 2 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <User className="h-4 w-4 text-green-600" />Select Tenant — auto-fills all details
//             </span>
//             <div className="flex items-center gap-2">
//               {fetchingDetail && <div className="flex items-center gap-1 text-[11px] text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" />Fetching…</div>}
//               <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
//             </div>
//           </div>
//           <div className="px-3 py-2 border-b bg-gray-50/50">
//             <div className="relative">
//               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
//               <Input placeholder="Search by name, phone, email…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}
//                 className="h-8 pl-8 text-[11px] bg-white border-gray-200" autoFocus />
//             </div>
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 330px)", overflowY:"auto" }}>
//             {loadingTenants ? (
//               <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
//             ) : tenantList.length === 0 ? (
//               <div className="text-center py-10"><User className="h-9 w-9 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No tenants found</p></div>
//             ) : (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                 {tenantList.map(t => (
//                   <button key={t.id} onClick={() => handleTenantSelect(t)} disabled={fetchingDetail}
//                     className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group disabled:opacity-60">
//                     <div className="flex items-center gap-2 mb-2">
//                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-sm">
//                         {(t.full_name || "?").charAt(0).toUpperCase()}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-[11px] font-black text-gray-800 group-hover:text-green-700 truncate">{t.full_name}</p>
//                         {(t.property_name || t.assigned_property_name) && (
//                           <p className="text-[9px] text-gray-400 flex items-center gap-1 truncate">
//                             <Building2 className="h-2.5 w-2.5 flex-shrink-0" />{t.property_name || t.assigned_property_name}
//                           </p>
//                         )}
//                       </div>
//                       {(t.room_number || t.assigned_room_number) && (
//                         <Badge className="bg-green-50 text-green-700 border border-green-200 text-[9px] px-1.5 py-0 flex-shrink-0">
//                           R-{t.room_number || t.assigned_room_number}
//                         </Badge>
//                       )}
//                     </div>
//                     <div className="space-y-0.5">
//                       {t.phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-gray-400" />{t.phone}</p>}
//                       {t.email && <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5 text-gray-400" />{t.email}</p>}
//                       {(t.monthly_rent || t.rent_per_bed) && (
//                         <p className="text-[10px] text-gray-500 flex items-center gap-1">
//                           <IndianRupee className="h-2.5 w-2.5 text-gray-400" />{money(t.monthly_rent || t.rent_per_bed)}/mo
//                         </p>
//                       )}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg">
//             <button onClick={() => { setStep(1); setSelTemplate(null); }}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />Back
//             </button>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 3: Fill Details ══ */}
//       {step === 3 && selTemplate && (
//         <Card className="border rounded-lg shadow-sm">
//           <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//             <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
//               <FileText className="h-4 w-4 text-blue-600" />Document Details
//             </span>
//             {selTenant && (
//               <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
//                 <UserCheck className="h-3 w-3 text-green-600" />
//                 <span className="text-[10px] font-semibold text-green-700">{selTenant.full_name}</span>
//                 <button onClick={() => setStep(2)} className="text-[9px] text-green-500 hover:underline ml-1">change</button>
//               </div>
//             )}
//           </div>
//           <div className="p-3" style={{ maxHeight:"calc(100vh - 270px)", overflowY:"auto" }}>

//             {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_TENANT.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData}
//                       required={["tenant_name","tenant_phone"].includes(v)} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {GROUP_PROPERTY.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<Building2 className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_PROPERTY.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {GROUP_COMPANY.some(v => visibleVars.includes(v)) && (
//               <div className="mb-4">
//                 <SH icon={<Building2 className="h-3 w-3" />} title="Company / Manager Info" color="text-orange-600" />
//                 <p className="text-[10px] text-orange-500 mb-2">Fill your company name and address manually</p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                   {GROUP_COMPANY.filter(v => visibleVars.includes(v)).map(v => (
//                     <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {(() => {
//               const rest = visibleVars.filter(v => !ALL_GROUPED.includes(v));
//               if (!rest.length) return null;
//               return (
//                 <div className="mb-4">
//                   <SH icon={<Hash className="h-3 w-3" />} title="Other Fields" color="text-gray-500" />
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
//                     {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
//                   </div>
//                 </div>
//               );
//             })()}

//             {selTenant && (
//               <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
//                 <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-[10px] text-blue-700">
//                   Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's full profile —
//                   property, room, bed, move-in date, rent, security deposit, emergency contact, company info.
//                 </p>
//               </div>
//             )}
//           </div>
//           <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
//             <button onClick={() => setStep(2)}
//               className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//               <ChevronLeft className="h-3 w-3" />Back
//             </button>
//             <div className="flex gap-2">
//               <button onClick={generatePreview}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
//                 <Eye className="h-3.5 w-3.5" />Preview
//               </button>
//               <button onClick={() => setStep(4)}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
//                 Next<ChevronRight className="h-3.5 w-3.5" />
//               </button>
//             </div>
//           </div>
//         </Card>
//       )}

//       {/* ══ STEP 4: Settings ══ */}
//       {step === 4 && selTemplate && (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
//           <div className="lg:col-span-2">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-white rounded-t-lg">
//                 <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
//                   <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
//                 </span>
//               </div>
//               <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.signatureRequired ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
//                   onClick={() => setSettings(p => ({ ...p, signatureRequired:!p.signatureRequired }))}>
//                   <div className="flex items-center gap-2">
//                     <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${settings.signatureRequired ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
//                       {settings.signatureRequired && <Check className="h-3 w-3 text-white" />}
//                     </div>
//                     <div>
//                       <p className="text-[11px] font-black text-gray-800">Signature Required</p>
//                       <p className="text-[9px] text-gray-500">Tenant must sign to complete</p>
//                     </div>
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><AlertCircle className="h-3 w-3 inline mr-1" />Priority</label>
//                   <div className="flex gap-1.5 flex-wrap">
//                     {PRIORITY_OPTS.map(o => (
//                       <button key={o.value} onClick={() => setSettings(p => ({ ...p, priority:o.value }))}
//                         className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all
//                           ${settings.priority === o.value ? "border-blue-500 bg-blue-600 text-white shadow-sm" : `${o.cls} border-transparent hover:border-gray-300`}`}>
//                         {o.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//                 <div>
//                   <label className={L}><Clock className="h-3 w-3 inline mr-1" />Expiry Date</label>
//                   <Input type="date" value={settings.expiryDate} onChange={e => setSettings(p => ({...p, expiryDate:e.target.value}))}
//                     min={new Date().toISOString().split("T")[0]} className={`${F} w-full`} />
//                 </div>
//                 <div>
//                   <label className={L}><Tag className="h-3 w-3 inline mr-1" />Tags</label>
//                   <Input ref={tagRef} placeholder="Press Enter to add…"
//                     onKeyDown={e => { if (e.key === "Enter" && tagRef.current) { addTag(tagRef.current.value); tagRef.current.value = ""; } }}
//                     className={`${F} w-full`} />
//                   <div className="flex flex-wrap gap-1 mt-1.5">
//                     {settings.tags.map(tag => (
//                       <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold flex items-center gap-1 border border-blue-200">
//                         {tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//               <div className="px-3 pb-3">
//                 <label className={L}>Notes</label>
//                 <textarea value={settings.notes} onChange={e => setSettings(p => ({...p, notes:e.target.value}))} rows={2}
//                   className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 focus:bg-white resize-none transition-all"
//                   placeholder="Any additional instructions…" />
//               </div>
//             </Card>
//           </div>

//           <div className="space-y-3">
//             <Card className="border rounded-lg shadow-sm">
//               <div className="px-3 py-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
//                 <span className="text-xs font-semibold text-white flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" />Document Summary</span>
//               </div>
//               <div className="p-3 space-y-2">
//                 {[
//                   ["Template",  selTemplate.name,                               "text-blue-700"],
//                   ["Tenant",    formData.tenant_name        || "—",             "text-gray-800"],
//                   ["Phone",     formData.tenant_phone       || "—",             "text-gray-600"],
//                   ["Property",  formData.property_name      || "—",             "text-gray-600"],
//                   ["Room",      formData.room_number        || "—",             "text-gray-600"],
//                   ["Bed",       formData.bed_number         || "—",             "text-gray-600"],
//                   ["Move-In",   formData.move_in_date       || "—",             "text-gray-600"],
//                   ["Rent",      formData.rent_amount        ? money(formData.rent_amount)     : "—", "text-green-700"],
//                   ["Deposit",   formData.security_deposit   ? money(formData.security_deposit): "—", "text-green-700"],
//                   ["Emergency", formData.emergency_contact_name || "—",         "text-gray-600"],
//                   ["Company",   formData.company_name       || "—",             "text-gray-600"],
//                   ["Priority",  settings.priority.toUpperCase(),                "text-orange-600"],
//                   ["Signature", settings.signatureRequired  ? "Required":"Not Required",
//                                 settings.signatureRequired  ? "text-blue-600":"text-gray-500"],
//                 ].map(([k,v,cls]) => (
//                   <div key={k} className="flex items-start justify-between gap-2">
//                     <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
//                     <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
//                   </div>
//                 ))}
//               </div>
//             </Card>
//             <div className="space-y-2">
//               <button onClick={generatePreview}
//                 className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
//                 <Eye className="h-3.5 w-3.5" />Preview Document
//               </button>
//               <button onClick={handleSave} disabled={saving}
//                 className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50">
//                 {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating…</> : <><Save className="h-3.5 w-3.5" />Create Document</>}
//               </button>
//               <button onClick={() => setStep(3)}
//                 className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
//                 <ChevronLeft className="h-3 w-3" />Back to Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ══ PREVIEW MODAL ══ */}
//       {showPreview && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
//           <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight:"92vh" }}>
//             <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Eye className="h-4 w-4 text-white" />
//                 <span className="text-sm font-semibold text-white">Document Preview</span>
//                 <Badge className="bg-white/20 text-white border-0 text-[10px]">Live Data</Badge>
//               </div>
//               <div className="flex items-center gap-1.5">
//                 <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><Printer className="h-4 w-4" /></button>
//                 <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
//               <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
//                 <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
//               </div>
//             </div>
//             <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
//               <button onClick={handlePrint}
//                 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
//                 <Printer className="h-3.5 w-3.5" />Print
//               </button>
//               <button onClick={() => setShowPreview(false)}
//                 className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// DocumentCreate.tsx
// Tenant fetch: uses tenantDetailsApi.getProfileById(id)  ← EXACTLY like TenantHandover
// Fetches: property_name, room_number, bed_number, move_in_date(check_in_date),
//          rent_amount(monthly_rent / rent_per_bed), security_deposit(from property),
//          emergency_contact_name, emergency_contact_phone
// Removed: document_title field from form

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FileText, Eye, Save, X, ChevronLeft, ChevronRight,
  Clock, CheckCircle, AlertCircle, Search, User, Phone,
  Mail, Building2, Loader2, UserCheck, Printer, RefreshCw,
  LayoutTemplate, Tag, Hash, Shield, Zap, Check, IndianRupee, Download,
} from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Badge }  from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { listTemplates, getTemplate, type DocumentTemplate } from "@/lib/documentTemplateApi";
import { listTenants }                                        from "@/lib/tenantApi";
// ── KEY: same import as TenantHandover ───────────────────────────────────────
import { tenantDetailsApi }                                   from "@/lib/tenantDetailsApi";
import { getProperty }                                        from "@/lib/propertyApi";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// ── Style tokens (same as TemplateManager & TenantHandover) ──────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide";
const SI = "text-[11px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ label, value, icon: Icon, accent }: any) => (
  <Card className="border-0 shadow-sm bg-white">
    <CardContent className="p-2.5 flex items-center gap-2">
      <div className={`p-1.5 rounded-lg ${accent}`}><Icon className="h-3.5 w-3.5 text-white" /></div>
      <div>
        <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xs font-bold text-gray-800">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const StepDot = ({ n, label, cur, done }: { n: number; label: string; cur: number; done: boolean }) => (
  <div className="flex items-center gap-1.5 flex-shrink-0">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all
      ${cur === n ? "bg-blue-600 text-white shadow-md shadow-blue-200" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
      {done ? <Check className="h-3 w-3" /> : n}
    </div>
    <span className={`text-[11px] font-semibold hidden sm:inline
      ${cur === n ? "text-blue-700" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
  </div>
);

// ── Constants ─────────────────────────────────────────────────────────────────
const TPL_CATS = [
  "All","Agreements","Rental Agreements","KYC Documents","Onboarding Documents",
  "Financial Documents","Policy Documents","Exit Documents","Inspection Forms","Declarations","Other",
];
const PRIORITY_OPTS = [
  { value:"low",    label:"Low",    cls:"bg-gray-100 text-gray-600" },
  { value:"normal", label:"Normal", cls:"bg-blue-100 text-blue-700" },
  { value:"high",   label:"High",   cls:"bg-orange-100 text-orange-700" },
  { value:"urgent", label:"Urgent", cls:"bg-red-100 text-red-700" },
];

// ── Fields per group ─────────────────────────────────────────────────────────
// company_name, company_address → shown in form, admin fills manually
// document_number, document_title → hidden (auto/hardcoded)
const HIDDEN_VARS    = ["document_number","logo_url","document_title"]; // document_number = backend auto-generates
const GROUP_SYSTEM   = ["document_type","date"];
const GROUP_TENANT   = ["tenant_name","tenant_phone","tenant_email","aadhaar_number","pan_number","emergency_contact_name","emergency_phone"];
const GROUP_PROPERTY = ["property_name","room_number","bed_number","move_in_date","rent_amount","security_deposit","payment_mode"];
const GROUP_COMPANY  = ["company_name","company_address"];
const ALL_GROUPED    = [...GROUP_SYSTEM, ...GROUP_TENANT, ...GROUP_PROPERTY, ...GROUP_COMPANY];

// ── Helpers ───────────────────────────────────────────────────────────────────
const safeNum  = (v: any) => { const n = parseFloat(String(v ?? "")); return isNaN(n) ? 0 : n; };
const money    = (v: any) => `₹${safeNum(v).toLocaleString("en-IN")}`;

// ── toInputDate: same as TenantHandover ───────────────────────────────────────
const toInputDate = (d: string | undefined | null): string => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toISOString().split("T")[0];
  } catch { return ""; }
};

const fmtDateLong = (d?: string | null) => {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });
  } catch { return ""; }
};

const todayStr = () =>
  new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" });

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getFieldType = (k: string) => {
  if (k.includes("date"))   return "date";
  if (k.includes("email"))  return "email";
  if (k.includes("phone"))  return "tel";
  if (["amount","deposit","rent"].some(x => k.includes(x))) return "number";
  return "text";
};
const getFieldLabel = (k: string) =>
  k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const renderHtml = (html: string, data: Record<string, string>, logoSrc?: string) => {
  let out = html;
  out = logoSrc
    ? out.replace(/\{\{logo_url\}\}/g, `<img src="${logoSrc}" style="max-height:60px;max-width:160px;object-fit:contain;" />`)
    : out.replace(/\{\{logo_url\}\}/g, "");
  Object.entries(data).forEach(([k, v]) => {
    out = out.replace(new RegExp(`\\{\\{${escRe(k)}\\}\\}`, "g"), v || "");
  });
  return out.replace(/\{\{[\w_]+\}\}/g, "—");
};

// ── FieldInput ────────────────────────────────────────────────────────────────
function FieldInput({ variable, formData, setFormData, required = false }: {
  variable: string;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  required?: boolean;
}) {
  // FIX: always convert to string — prevents "trim is not a function" when value is number/null/undefined
  const raw    = formData[variable];
  const strVal = raw != null ? String(raw) : "";
  const filled = !!strVal.trim();

  return (
    <div>
      <label className={L}>
        {getFieldLabel(variable)}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={getFieldType(variable)}
        value={strVal}
        onChange={e => setFormData(p => ({ ...p, [variable]: e.target.value }))}
        placeholder={getFieldLabel(variable)}
        className={`w-full h-8 px-2.5 text-[11px] border rounded-md transition-all font-medium outline-none
          ${filled
            ? "border-green-300 bg-green-50/40 focus:border-green-400 focus:ring-1 focus:ring-green-100"
            : "border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100"}`}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export function DocumentCreate() {
  // Templates
  const [templates,      setTemplates]      = useState<DocumentTemplate[]>([]);
  const [filteredTpls,   setFilteredTpls]   = useState<DocumentTemplate[]>([]);
  const [selTemplate,    setSelTemplate]    = useState<DocumentTemplate | null>(null);
  const [loadingTpls,    setLoadingTpls]    = useState(true);
  const [tplSearch,      setTplSearch]      = useState("");
  const [catFilter,      setCatFilter]      = useState("All");

  // Tenants
  const [tenantList,     setTenantList]     = useState<any[]>([]);
  const [tenantSearch,   setTenantSearch]   = useState("");
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [selTenant,      setSelTenant]      = useState<any | null>(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const [step,        setStep]        = useState(1);
  const [formData,    setFormData]    = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving,      setSaving]      = useState(false);

  const [settings, setSettings] = useState({
    signatureRequired: false, priority: "normal",
    expiryDate: "", tags: [] as string[], notes: "",
  });
  const tagRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => ({
    total:  templates.length,
    active: templates.filter(t => t.is_active).length,
    cats:   new Set(templates.map(t => t.category)).size,
  }), [templates]);

  // ── Load templates ──────────────────────────────────────────────────────────
  const loadTemplates = useCallback(async () => {
    setLoadingTpls(true);
    try { const res = await listTemplates({ is_active:"true" }); setTemplates(res.data || []); }
    catch { toast.error("Failed to load templates"); }
    finally { setLoadingTpls(false); }
  }, []);
  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  // Filter templates
  useEffect(() => {
    let list = [...templates];
    if (catFilter !== "All") list = list.filter(t => t.category === catFilter);
    if (tplSearch.trim()) {
      const s = tplSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(s) || t.category.toLowerCase().includes(s));
    }
    setFilteredTpls(list);
  }, [templates, tplSearch, catFilter]);

  // ── Search tenants ──────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    setLoadingTenants(true);
    try {
      const res = await listTenants({ search: q || undefined, pageSize: 40, is_active: "true" });
      setTenantList(res.data || []);
    } catch { toast.error("Failed to search tenants"); }
    finally { setLoadingTenants(false); }
  }, []);
  useEffect(() => {
    if (step !== 2) return;
    const t = setTimeout(() => doSearch(tenantSearch), 320);
    return () => clearTimeout(t);
  }, [tenantSearch, step, doSearch]);
  useEffect(() => { if (step === 2) doSearch(""); }, [step, doSearch]);

  // ── Step 1: select template ─────────────────────────────────────────────────
  const handleTemplateSelect = async (tpl: DocumentTemplate) => {
    let full = tpl;
    if (!tpl.html_content) {
      try { const r = await getTemplate(tpl.id); full = r.data || tpl; } catch {}
    }
    setSelTemplate(full);
    setStep(2);
  };

  // ── Step 2: select tenant — EXACTLY like TenantHandover ─────────────────────
  // Uses tenantDetailsApi.getProfileById → /api/tenant-details/profile/:id
  // Reads same fields: property_id, property_name, room_number, bed_number,
  //                    check_in_date, monthly_rent, rent_per_bed,
  //                    emergency_contact_name, emergency_contact_phone
  const handleTenantSelect = async (t: any) => {
    setSelTenant(t);
    setFetchingDetail(true);

    // Step 1: set basic info from list immediately
    const base: Record<string, string> = {
      date:         todayStr(),
      document_type: selTemplate!.category,
      tenant_name:     t.full_name || "",
      tenant_phone:    t.phone     || "",
      tenant_email:    t.email     || "",
    };
    // Initialise all template vars
    (selTemplate!.variables || []).forEach(v => { if (!(v in base)) base[v] = ""; });
    setFormData(base);

    try {
      // ── KEY: getProfileById — same call as TenantHandover ──────────────────
      const res = await tenantDetailsApi.getProfileById(String(t.id));
      const d   = res?.data;
      if (!d) throw new Error("No data");

      // Fetch security deposit from property — same as TenantHandover
      let secDeposit = 0;
      if (d.property_id) {
        try {
          const propRes = await getProperty(String(d.property_id));
          if (propRes?.success && propRes?.data) {
            secDeposit = safeNum(propRes.data.security_deposit);
          }
        } catch { /* ignore */ }
      }

      // Map all fields — mirrors TenantHandover exactly
      const mapped: Record<string, string> = {
        date:          todayStr(),
        document_type: selTemplate!.category,

        // Personal
        tenant_name:            d.full_name                  || t.full_name || "",
        tenant_phone:           d.phone                      || t.phone     || "",
        tenant_email:           d.email                      || t.email     || "",
        aadhaar_number:         "",
        pan_number:             "",
        emergency_contact_name: d.emergency_contact_name     || "",
        emergency_phone:        d.emergency_contact_phone    || "",

        // Property — uses same fields as TenantHandover
        property_name:          d.property_name              || "",
        room_number:            d.room_number                || "",
        bed_number:             d.bed_number != null         ? String(d.bed_number) : "",
        // move_in_date as YYYY-MM-DD for date input (same toInputDate as TenantHandover)
        move_in_date:           toInputDate(d.check_in_date) || toInputDate(d.move_in_date) || "",
        rent_amount:            d.monthly_rent != null       ? String(safeNum(d.monthly_rent))
                                : d.rent_per_bed != null     ? String(safeNum(d.rent_per_bed)) : "",
        security_deposit:       secDeposit > 0               ? String(secDeposit) : "",
        payment_mode:           "UPI / Bank Transfer",

        // Company — admin fills manually, do NOT auto-fill from tenant/property data
        company_name:           "",
        company_address:        "",
      };

      // Fill remaining template vars
      (selTemplate!.variables || []).forEach(v => { if (!(v in mapped)) mapped[v] = ""; });
      setFormData(mapped);
      toast.success(`✅ Auto-filled from ${d.full_name || t.full_name}`);
    } catch {
      // Fallback: use list-level data
      const fallback: Record<string, string> = {
        date:          todayStr(),
        document_type: selTemplate!.category,
        tenant_name:     t.full_name || "",
        tenant_phone:    t.phone     || "",
        tenant_email:    t.email     || "",
        property_name:   t.property_name || t.assigned_property_name || "",
        room_number:     t.room_number   || t.assigned_room_number   || "",
        bed_number:      t.bed_number != null ? String(t.bed_number) : "",
        rent_amount:     t.monthly_rent ? String(safeNum(t.monthly_rent)) : "",
        security_deposit:"",
        payment_mode:    "UPI / Bank Transfer",
        company_name:    "",
        company_address: "",
        emergency_contact_name: "",
        emergency_phone: "",
        aadhaar_number:  "",
        pan_number:      "",
      };
      (selTemplate!.variables || []).forEach(v => { if (!(v in fallback)) fallback[v] = ""; });
      setFormData(fallback);
      toast.info("Basic info filled — some fields may need manual entry");
    } finally {
      setFetchingDetail(false);
      setStep(3);
    }
  };

  const skipTenant = () => {
    setSelTenant(null);
    const empty: Record<string, string> = {
      date:          todayStr(),
      document_type: selTemplate!.category,
    };
    (selTemplate!.variables || []).forEach(v => { if (!(v in empty)) empty[v] = ""; });
    setFormData(empty);
    setStep(3);
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const generatePreview = () => {
    if (!selTemplate?.html_content) return;
    const logo = selTemplate.logo_url
      ? (selTemplate.logo_url.startsWith("http") ? selTemplate.logo_url : `${API_BASE}${selTemplate.logo_url}`)
      : "";
    // Generate a preview doc number in same format as backend trigger
    const now     = new Date();
    const prefix  = "DOC-" + now.getFullYear() + String(now.getMonth()+1).padStart(2,"0") + "-";
    const previewNum = prefix + String(Math.floor(Math.random()*999)+1).padStart(6,"0");
    const previewData = { ...formData, document_number: previewNum };
    setPreviewHtml(renderHtml(selTemplate.html_content, previewData, logo));
    setShowPreview(true);
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<html><head><title>Doc</title></head><body>${previewHtml}</body></html>`);
      w.document.close(); w.focus(); w.print();
    }
  };

  // ── Download: opens print dialog with exact template → Save as PDF ───────────
  // No library needed — uses browser's built-in print-to-PDF
  const handleDownload = () => {
    if (!previewHtml) {
      toast.error("Please open Preview first, then click Download");
      return;
    }
    const tenantName = formData.tenant_name || "document";
    const docName    = selTemplate?.name    || "Document";

    const printWin = window.open("", "_blank", "width=900,height=700");
    if (!printWin) { toast.error("Popup blocked — allow popups and try again"); return; }

    printWin.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${docName} — ${tenantName}</title>
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
${previewHtml}
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
    toast.success("Print dialog opened — select 'Save as PDF' to download");
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  // In DocumentCreate.tsx - Find the handleSave function and update it:

const handleSave = async () => {
  if (!formData.tenant_name?.trim())  { toast.error("Tenant Name required");  return; }
  if (!formData.tenant_phone?.trim()) { toast.error("Tenant Phone required"); return; }
  setSaving(true);
  try {
    const token    = localStorage.getItem("admin_token");
    const logo     = selTemplate!.logo_url
      ? (selTemplate!.logo_url.startsWith("http") ? selTemplate!.logo_url : `${API_BASE}${selTemplate!.logo_url}`)
      : "";
    const finalHtml = renderHtml(selTemplate!.html_content, formData, logo);

    // REMOVE document_number from payload - let backend generate it
    const payload = {
      template_id:        selTemplate!.id,
      document_name:      selTemplate!.name,
      tenant_id:          selTenant?.id     || null,
      tenant_name:        formData.tenant_name,
      tenant_phone:       formData.tenant_phone,
      tenant_email:       formData.tenant_email   || null,
      property_name:      formData.property_name  || null,
      room_number:        formData.room_number     || null,
      html_content:       finalHtml,
      data_json:          formData,  // This contains all form fields including any document_number from preview
      status:             "Created",
      created_by:         "Admin",
      signature_required: settings.signatureRequired,
      priority:           settings.priority,
      expiry_date:        settings.expiryDate || null,
      tags:               settings.tags,
      notes:              settings.notes      || null,
    };

    // Log to verify document_number is not being sent
    console.log('Saving document without document_number:', payload);

    const res = await fetch(`${API_BASE}/api/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    toast.success(`✅ Document created! No: ${data.data?.document_number || "N/A"}`);
    setStep(1); setSelTemplate(null); setSelTenant(null); setFormData({});
    setSettings({ signatureRequired:false, priority:"normal", expiryDate:"", tags:[], notes:"" });
  } catch (e: any) { 
    console.error('Save error:', e);
    toast.error(e.message || "Failed to create document"); 
  } finally { 
    setSaving(false); 
  }
};

  const addTag    = (v: string) => { if (v.trim() && !settings.tags.includes(v.trim())) setSettings(p => ({ ...p, tags:[...p.tags, v.trim()] })); };
  const removeTag = (v: string) => setSettings(p => ({ ...p, tags:p.tags.filter(t => t !== v) }));

  // Visible vars — exclude auto-set fields (document_number, logo_url, document_title)
  const visibleVars = useMemo(() =>
    (selTemplate?.variables || []).filter(v => !HIDDEN_VARS.includes(v)),
    [selTemplate]);

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="bg-gray-50 min-h-full">

      {/* ── STICKY HEADER ── */}
      <div className="sticky top-16 z-10 pb-2">
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            {selTemplate && (
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 shadow-sm min-w-0 text-[11px]">
                <FileText className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-blue-700 truncate max-w-[120px]">{selTemplate.name}</span>
                {selTenant && (
                  <><ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />
                  <User className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="font-semibold text-green-700 truncate max-w-[100px]">{selTenant.full_name}</span></>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={loadTemplates} disabled={loadingTpls}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 shadow-sm">
              <RefreshCw className={`h-3.5 w-3.5 ${loadingTpls ? "animate-spin":""}`} />
            </button>
            {step > 1 && (
              <button onClick={() => { setStep(1); setSelTemplate(null); setSelTenant(null); }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium shadow-sm">
                <X className="h-3.5 w-3.5" />Start Over
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <StatCard label="Templates"  value={stats.total}  icon={LayoutTemplate} accent="bg-blue-600" />
          <StatCard label="Active"     value={stats.active} icon={CheckCircle}    accent="bg-green-500" />
          <StatCard label="Categories" value={stats.cats}   icon={Tag}            accent="bg-indigo-600" />
        </div>

        {/* Steps */}
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm overflow-x-auto">
          {["Select Template","Select Tenant","Fill Details","Settings & Save"].map((label, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <StepDot n={i+1} label={label} cur={step} done={step > i+1} />
              {i < 3 && <ChevronRight className="h-3 w-3 text-gray-300 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STEP 1: Templates ══ */}
      {step === 1 && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <LayoutTemplate className="h-4 w-4 text-blue-600" />Choose Template ({filteredTpls.length})
            </span>
            {(tplSearch || catFilter !== "All") && (
              <button onClick={() => { setTplSearch(""); setCatFilter("All"); }} className="text-[10px] text-blue-600 font-semibold">Clear</button>
            )}
          </div>
          <div className="px-3 py-2 border-b bg-gray-50/50 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search templates…" value={tplSearch} onChange={e => setTplSearch(e.target.value)} className="h-8 pl-8 text-[11px] bg-white border-gray-200" />
            </div>
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="h-8 w-[160px] text-[11px] bg-white border-gray-200"><SelectValue /></SelectTrigger>
              <SelectContent>{TPL_CATS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="p-3" style={{ maxHeight:"calc(100vh - 310px)", overflowY:"auto" }}>
            {loadingTpls ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : filteredTpls.length === 0 ? (
              <div className="text-center py-12"><LayoutTemplate className="h-10 w-10 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No templates found</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredTpls.map(t => (
                  <button key={t.id} onClick={() => handleTemplateSelect(t)}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group relative">
                    {t.is_active && <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-green-500" />}
                    <div className="flex items-start gap-2 mb-2">
                      {t.logo_url ? (
                        <img src={t.logo_url.startsWith("http") ? t.logo_url : `${API_BASE}${t.logo_url}`} alt=""
                          className="h-7 w-10 object-contain rounded border border-gray-100 bg-gray-50 p-0.5 flex-shrink-0"
                          onError={e => (e.currentTarget.style.display = "none")} />
                      ) : (
                        <div className="h-7 w-7 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                      )}
                      <p className="text-[11px] font-black text-gray-800 group-hover:text-blue-700 leading-tight line-clamp-2">{t.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0">{t.category}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] px-1.5 py-0">v{t.version}</Badge>
                      <span className="text-[9px] text-gray-400 ml-auto">{t.variables?.length || 0} vars</span>
                    </div>
                    {t.description && <p className="text-[9px] text-gray-400 mt-1.5 line-clamp-1">{t.description}</p>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ══ STEP 2: Select Tenant ══ */}
      {step === 2 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <User className="h-4 w-4 text-green-600" />Select Tenant — auto-fills all details
            </span>
            <div className="flex items-center gap-2">
              {fetchingDetail && <div className="flex items-center gap-1 text-[11px] text-blue-600"><Loader2 className="h-3.5 w-3.5 animate-spin" />Fetching…</div>}
              <button onClick={skipTenant} className="h-7 px-2.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">Skip →</button>
            </div>
          </div>
          <div className="px-3 py-2 border-b bg-gray-50/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input placeholder="Search by name, phone, email…" value={tenantSearch} onChange={e => setTenantSearch(e.target.value)}
                className="h-8 pl-8 text-[11px] bg-white border-gray-200" autoFocus />
            </div>
          </div>
          <div className="p-3" style={{ maxHeight:"calc(100vh - 330px)", overflowY:"auto" }}>
            {loadingTenants ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>
            ) : tenantList.length === 0 ? (
              <div className="text-center py-10"><User className="h-9 w-9 text-gray-300 mx-auto mb-2" /><p className="text-sm font-medium text-gray-500">No tenants found</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {tenantList.map(t => (
                  <button key={t.id} onClick={() => handleTenantSelect(t)} disabled={fetchingDetail}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-md transition-all group disabled:opacity-60">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-black text-sm">
                        {(t.full_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black text-gray-800 group-hover:text-green-700 truncate">{t.full_name}</p>
                        {(t.property_name || t.assigned_property_name) && (
                          <p className="text-[9px] text-gray-400 flex items-center gap-1 truncate">
                            <Building2 className="h-2.5 w-2.5 flex-shrink-0" />{t.property_name || t.assigned_property_name}
                          </p>
                        )}
                      </div>
                      {(t.room_number || t.assigned_room_number) && (
                        <Badge className="bg-green-50 text-green-700 border border-green-200 text-[9px] px-1.5 py-0 flex-shrink-0">
                          R-{t.room_number || t.assigned_room_number}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {t.phone && <p className="text-[10px] text-gray-500 flex items-center gap-1"><Phone className="h-2.5 w-2.5 text-gray-400" />{t.phone}</p>}
                      {t.email && <p className="text-[10px] text-gray-500 flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5 text-gray-400" />{t.email}</p>}
                      {(t.monthly_rent || t.rent_per_bed) && (
                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                          <IndianRupee className="h-2.5 w-2.5 text-gray-400" />{money(t.monthly_rent || t.rent_per_bed)}/mo
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg">
            <button onClick={() => { setStep(1); setSelTemplate(null); }}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />Back
            </button>
          </div>
        </Card>
      )}

      {/* ══ STEP 3: Fill Details ══ */}
      {step === 3 && selTemplate && (
        <Card className="border rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-600" />Document Details
            </span>
            {selTenant && (
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-md px-2 py-1">
                <UserCheck className="h-3 w-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-700">{selTenant.full_name}</span>
                <button onClick={() => setStep(2)} className="text-[9px] text-green-500 hover:underline ml-1">change</button>
              </div>
            )}
          </div>
          <div className="p-3" style={{ maxHeight:"calc(100vh - 270px)", overflowY:"auto" }}>

            {GROUP_SYSTEM.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<FileText className="h-3 w-3" />} title="Document Info" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_SYSTEM.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_TENANT.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<User className="h-3 w-3" />} title="Tenant Information" color="text-green-600" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_TENANT.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData}
                      required={["tenant_name","tenant_phone"].includes(v)} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_PROPERTY.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<Building2 className="h-3 w-3" />} title="Property Details" color="text-indigo-600" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_PROPERTY.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {GROUP_COMPANY.some(v => visibleVars.includes(v)) && (
              <div className="mb-4">
                <SH icon={<Building2 className="h-3 w-3" />} title="Company / Manager Info" color="text-orange-600" />
                <p className="text-[10px] text-orange-500 mb-2">Fill your company name and address manually</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {GROUP_COMPANY.filter(v => visibleVars.includes(v)).map(v => (
                    <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
            )}

            {(() => {
              const rest = visibleVars.filter(v => !ALL_GROUPED.includes(v));
              if (!rest.length) return null;
              return (
                <div className="mb-4">
                  <SH icon={<Hash className="h-3 w-3" />} title="Other Fields" color="text-gray-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {rest.map(v => <FieldInput key={v} variable={v} formData={formData} setFormData={setFormData} />)}
                  </div>
                </div>
              );
            })()}

            {selTenant && (
              <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700">
                  Fields in <span className="font-bold text-green-600">green</span> are auto-filled from tenant's full profile —
                  property, room, bed, move-in date, rent, security deposit, emergency contact, company info.
                </p>
              </div>
            )}
          </div>
          <div className="px-3 py-2.5 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button onClick={() => setStep(2)}
              className="inline-flex items-center gap-1 h-7 px-3 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              <ChevronLeft className="h-3 w-3" />Back
            </button>
            <div className="flex gap-2">
              <button onClick={generatePreview}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md">
                <Eye className="h-3.5 w-3.5" />Preview
              </button>
              <button onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
                Next<ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ══ STEP 4: Settings ══ */}
      {step === 4 && selTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <Card className="border rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b bg-white rounded-t-lg">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />Document Options
                </span>
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${settings.signatureRequired ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  onClick={() => setSettings(p => ({ ...p, signatureRequired:!p.signatureRequired }))}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${settings.signatureRequired ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                      {settings.signatureRequired && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-gray-800">Signature Required</p>
                      <p className="text-[9px] text-gray-500">Tenant must sign to complete</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={L}><AlertCircle className="h-3 w-3 inline mr-1" />Priority</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRIORITY_OPTS.map(o => (
                      <button key={o.value} onClick={() => setSettings(p => ({ ...p, priority:o.value }))}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold border-2 transition-all
                          ${settings.priority === o.value ? "border-blue-500 bg-blue-600 text-white shadow-sm" : `${o.cls} border-transparent hover:border-gray-300`}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={L}><Clock className="h-3 w-3 inline mr-1" />Expiry Date</label>
                  <Input type="date" value={settings.expiryDate} onChange={e => setSettings(p => ({...p, expiryDate:e.target.value}))}
                    min={new Date().toISOString().split("T")[0]} className={`${F} w-full`} />
                </div>
                <div>
                  <label className={L}><Tag className="h-3 w-3 inline mr-1" />Tags</label>
                  <Input ref={tagRef} placeholder="Press Enter to add…"
                    onKeyDown={e => { if (e.key === "Enter" && tagRef.current) { addTag(tagRef.current.value); tagRef.current.value = ""; } }}
                    className={`${F} w-full`} />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {settings.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[9px] font-bold flex items-center gap-1 border border-blue-200">
                        {tag}<button onClick={() => removeTag(tag)}><X className="h-2.5 w-2.5" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-3 pb-3">
                <label className={L}>Notes</label>
                <textarea value={settings.notes} onChange={e => setSettings(p => ({...p, notes:e.target.value}))} rows={2}
                  className="w-full px-2.5 py-2 text-[11px] border border-gray-200 rounded-md focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-gray-50 focus:bg-white resize-none transition-all"
                  placeholder="Any additional instructions…" />
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <Card className="border rounded-lg shadow-sm">
              <div className="px-3 py-2 border-b bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" />Document Summary</span>
              </div>
              <div className="p-3 space-y-2">
                {[
                  ["Template",  selTemplate.name,                               "text-blue-700"],
                  ["Tenant",    formData.tenant_name        || "—",             "text-gray-800"],
                  ["Phone",     formData.tenant_phone       || "—",             "text-gray-600"],
                  ["Property",  formData.property_name      || "—",             "text-gray-600"],
                  ["Room",      formData.room_number        || "—",             "text-gray-600"],
                  ["Bed",       formData.bed_number         || "—",             "text-gray-600"],
                  ["Move-In",   formData.move_in_date       || "—",             "text-gray-600"],
                  ["Rent",      formData.rent_amount        ? money(formData.rent_amount)     : "—", "text-green-700"],
                  ["Deposit",   formData.security_deposit   ? money(formData.security_deposit): "—", "text-green-700"],
                  ["Emergency", formData.emergency_contact_name || "—",         "text-gray-600"],
                  ["Company",   formData.company_name       || "—",             "text-gray-600"],
                  ["Priority",  settings.priority.toUpperCase(),                "text-orange-600"],
                  ["Signature", settings.signatureRequired  ? "Required":"Not Required",
                                settings.signatureRequired  ? "text-blue-600":"text-gray-500"],
                ].map(([k,v,cls]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">{k}</span>
                    <span className={`text-[10px] font-bold text-right truncate max-w-[140px] ${cls}`}>{v}</span>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-2">
              <button onClick={generatePreview}
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[11px] font-semibold hover:shadow-md transition-all">
                <Eye className="h-3.5 w-3.5" />Preview Document
              </button>
              <button onClick={handleSave} disabled={saving}
                className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold hover:shadow-md transition-all disabled:opacity-50">
                {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating…</> : <><Save className="h-3.5 w-3.5" />Create Document</>}
              </button>
              <button onClick={() => setStep(3)}
                className="w-full inline-flex items-center justify-center gap-1 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50">
                <ChevronLeft className="h-3 w-3" />Back to Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ PREVIEW MODAL ══ */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col" style={{ maxHeight:"92vh" }}>
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Document Preview</span>
                <Badge className="bg-white/20 text-white border-0 text-[10px]">Live Data</Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={handleDownload} className="p-1.5 rounded-lg hover:bg-white/20 text-white" title="Download PDF"><Download className="h-4 w-4" /></button>
                <button onClick={handlePrint}    className="p-1.5 rounded-lg hover:bg-white/20 text-white" title="Print"><Printer className="h-4 w-4" /></button>
                <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div className="bg-white rounded-lg shadow-md max-w-[210mm] mx-auto">
                <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
              </div>
            </div>
            <div className="flex-shrink-0 px-4 py-2.5 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
              <button onClick={handleDownload}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:shadow-md">
                <Download className="h-3.5 w-3.5" />Download
              </button>
              <button onClick={handlePrint}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-semibold">
                <Printer className="h-3.5 w-3.5" />Print
              </button>
              <button onClick={() => setShowPreview(false)}
                className="h-8 px-3 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}