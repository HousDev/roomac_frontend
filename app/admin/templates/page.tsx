"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Copy,
  Eye,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useRouter } from '@/src/compat/next-navigation';

interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface TemplateLayout {
  header?: {
    show: boolean;
    includeImage: boolean;
  };
  footer?: {
    show: boolean;
    text: string;
  };
  colors?: {
    primary: string;
    secondary: string;
  };
}

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: TemplateField[];
  layout: TemplateLayout;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function TemplateManagementPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    description: '',
    is_active: true
  });

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [layout, setLayout] = useState<TemplateLayout>({
    header: { show: true, includeImage: true },
    footer: { show: true, text: 'Thank you' },
    colors: { primary: '#2563eb', secondary: '#64748b' }
  });

  const [currentField, setCurrentField] = useState<TemplateField>({
    name: '',
    label: '',
    type: 'text',
    required: false,
    options: []
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const apiBase = '/api/document-templates';

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (!res.ok) {
        throw new Error(`Failed to fetch templates: ${res.status}`);
      }
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!formData.name || !formData.type) {
        toast.error('Please fill in all required fields');
        return;
      }

      const templateData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        fields,
        layout,
        is_active: formData.is_active
      };

      if (editingTemplate) {
        // Update
        const res = await fetch(`${apiBase}/${editingTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...templateData })
        });
        if (!res.ok) throw new Error('Failed to update template');
        toast.success('Template updated successfully');
      } else {
        // Create
        const res = await fetch(apiBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templateData)
        });
        if (!res.ok) throw new Error('Failed to create template');
        toast.success('Template created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description,
      is_active: template.is_active
    });
    setFields(template.fields || []);
    setLayout(template.layout || layout);
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete template');
      toast.success('Template deleted successfully');
      await loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleDuplicateTemplate = async (template: DocumentTemplate) => {
    try {
      const copy = {
        ...template,
        name: `${template.name} (Copy)`,
        is_active: false,
        // remove id and timestamps in body (backend should create new id)
      };
      // backend should ignore id if present; to be safe, omit it
      // @ts-ignore
      delete copy.id;
      // @ts-ignore
      delete copy.created_at;
      // @ts-ignore
      delete copy.updated_at;

      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy)
      });
      if (!res.ok) throw new Error('Failed to duplicate template');
      toast.success('Template duplicated successfully');
      await loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to toggle template');
      toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'}`);
      await loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
      toast.error('Failed to update template');
    }
  };

  const addField = () => {
    if (!currentField.name || !currentField.label) {
      toast.error('Please fill in field name and label');
      return;
    }

    setFields([...fields, currentField]);
    setCurrentField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
    setIsFieldDialogOpen(false);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      description: '',
      is_active: true
    });
    setFields([]);
    setLayout({
      header: { show: true, includeImage: true },
      footer: { show: true, text: 'Thank you' },
      colors: { primary: '#2563eb', secondary: '#64748b' }
    });
    setEditingTemplate(null);
    setCurrentField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      receipt: 'bg-blue-100 text-blue-800',
      checkin: 'bg-green-100 text-green-800',
      checkout: 'bg-orange-100 text-orange-800',
      terms: 'bg-purple-100 text-purple-800',
      agreement: 'bg-pink-100 text-pink-800',
      custom: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[type] || colors.custom}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/document-center')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Document Templates</h1>
            <p className="text-gray-600 mt-1">Create and manage document templates</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                Design your document template with custom fields and layout
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Rent Receipt - Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="type">Document Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receipt">Receipt</SelectItem>
                      <SelectItem value="checkin">Check-In Form</SelectItem>
                      <SelectItem value="checkout">Check-Out Form</SelectItem>
                      <SelectItem value="terms">Terms & Conditions</SelectItem>
                      <SelectItem value="agreement">Agreement</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Active Template</Label>
                </div>
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Template Fields</h3>
                  <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Field</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Field Name (no spaces)</Label>
                          <Input
                            value={currentField.name}
                            onChange={(e) => setCurrentField({ ...currentField, name: e.target.value.replace(/\s/g, '_') })}
                            placeholder="e.g., tenant_name"
                          />
                        </div>
                        <div>
                          <Label>Field Label</Label>
                          <Input
                            value={currentField.label}
                            onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                            placeholder="e.g., Tenant Name"
                          />
                        </div>
                        <div>
                          <Label>Field Type</Label>
                          <Select
                            value={currentField.type}
                            onValueChange={(value: any) => setCurrentField({ ...currentField, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="textarea">Text Area</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {currentField.type === 'select' && (
                          <div>
                            <Label>Options (comma separated)</Label>
                            <Input
                              onChange={(e) => setCurrentField({
                                ...currentField,
                                options: e.target.value.split(',').map(o => o.trim())
                              })}
                              placeholder="Option1, Option2, Option3"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={currentField.required}
                            onCheckedChange={(checked) => setCurrentField({ ...currentField, required: checked })}
                          />
                          <Label>Required Field</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addField}>Add Field</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {fields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No fields added yet. Click "Add Field" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <Card key={index}>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{field.label}</span>
                              <Badge variant="outline">{field.type}</Badge>
                              {field.required && <Badge variant="destructive">Required</Badge>}
                            </div>
                            <p className="text-sm text-gray-500">{field.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="layout" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Header Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layout.header?.show}
                        onCheckedChange={(checked) => setLayout({
                          ...layout,
                          header: { ...layout.header!, show: checked }
                        })}
                      />
                      <Label>Show Header</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layout.header?.includeImage}
                        onCheckedChange={(checked) => setLayout({
                          ...layout,
                          header: { ...layout.header!, includeImage: checked }
                        })}
                      />
                      <Label>Include Logo</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Footer Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={layout.footer?.show}
                        onCheckedChange={(checked) => setLayout({
                          ...layout,
                          footer: { ...layout.footer!, show: checked }
                        })}
                      />
                      <Label>Show Footer</Label>
                    </div>
                    <div>
                      <Label>Footer Text</Label>
                      <Input
                        value={layout.footer?.text}
                        onChange={(e) => setLayout({
                          ...layout,
                          footer: { ...layout.footer!, text: e.target.value }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Color Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={layout.colors?.primary}
                        onChange={(e) => setLayout({
                          ...layout,
                          colors: { ...layout.colors!, primary: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={layout.colors?.secondary}
                        onChange={(e) => setLayout({
                          ...layout,
                          colors: { ...layout.colors!, secondary: e.target.value }
                        })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className={`hover:shadow-lg transition-shadow ${!template.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {template.name}
                    {!template.is_active && <Badge variant="secondary">Inactive</Badge>}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </div>
                {getTypeBadge(template.type)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fields:</span>
                  <Badge variant="outline">{template.fields?.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-gray-900">
                    {format(new Date(template.updated_at || template.created_at), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={template.is_active ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(template.id, template.is_active)}
                    className="flex-1"
                  >
                    {template.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first document template to get started
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
