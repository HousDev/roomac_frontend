"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/data-table';
import { ChevronRight } from 'lucide-react';
import {
  FileText, Download, Printer, Share2, Plus, Search,
  Receipt, ClipboardList, LogOut, FileCheck, Trash2, Calendar,
  Users, Filter, RefreshCw, File, Eye, Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { DocumentData, downloadPDF, printPDF, sharePDF } from '@/lib/pdf-generator';
import { toast } from 'sonner';
import { TrendingUp } from "lucide-react";


interface SavedDocument {
  id: string;
  tenant_id: string;
  type: string;
  title: string;
  created_at: string;
  data: DocumentData;
  tenants?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_id: string;
  property_id: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''; // set to your backend base URL

async function safeFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const defaultHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
  // If you have auth, add here: defaultHeaders['Authorization'] = `Bearer ${token}`;
  try {
    const res = await fetch(url, { headers: defaultHeaders, ...opts });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return await res.json();
  } catch (err) {
    console.error('API error', url, err);
    throw err;
  }
}

export default function AdminDocumentCenter() {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);

  const [documentType, setDocumentType] = useState<DocumentData['type']>('receipt');
  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: 'cash',
    paymentType: 'rent',
    month: format(new Date(), 'MMMM yyyy'),
    roomCondition: 'Good',
    inventoryItems: 'Bed\nMattress\nStudy Table\nChair\nWardrobe\nFan',
    securityDeposit: '',
    advanceRent: '',
    agreementDuration: '12 months',
    exitDate: format(new Date(), 'yyyy-MM-dd'),
    damagesFound: 'None',
    depositRefund: '',
    duesCleared: 'yes',
    clearanceNotes: 'All dues cleared. Tenant vacated the premises in good condition.',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [documentsData, tenantsData, propertiesData] = await Promise.all([
        safeFetch('/documents?_sort=created_at:desc'),
        safeFetch('/tenants?status=active&_sort=name'),
        safeFetch('/properties?_sort=name')
      ]);

      setDocuments(documentsData || []);
      setTenants(tenantsData || []);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getTenantData = async (tenantId: string) => {
    // tries GET /tenants/:id and expects properties and rooms nested or adjust backend accordingly
    const tenant = await safeFetch(`/tenants/${tenantId}`);
    return tenant;
  };

  const getDocumentData = async (tenantId: string): Promise<DocumentData> => {
    const tenant = await getTenantData(tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const baseData = {
      property: {
        name: tenant.properties?.name || 'Property Name',
        address: tenant.properties?.address || 'Property Address',
        phone: tenant.properties?.manager_phone || '+91 9876543210',
        email: tenant.properties?.manager_email || 'info@roomac.com',
      },
      tenant: {
        name: tenant.name || 'Tenant Name',
        email: tenant.email || 'tenant@email.com',
        phone: tenant.phone || '+91 0000000000',
        roomNumber: tenant.rooms?.room_number || 'N/A',
        checkInDate: tenant.check_in_date ? format(new Date(tenant.check_in_date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
      },
    };

    switch (documentType) {
      case 'receipt':
        return {
          ...baseData,
          type: 'receipt',
          payment: {
            receiptNumber: formData.receiptNumber,
            amount: parseFloat(formData.amount) || 0,
            paymentDate: format(new Date(formData.paymentDate), 'dd/MM/yyyy'),
            paymentMethod: formData.paymentMethod,
            paymentType: formData.paymentType,
            month: formData.month,
          },
        };

      case 'checkin':
        return {
          ...baseData,
          type: 'checkin',
          checkin: {
            roomCondition: formData.roomCondition,
            inventoryList: formData.inventoryItems.split('\n').filter(item => item.trim()),
            securityDeposit: parseFloat(formData.securityDeposit) || 0,
            advanceRent: parseFloat(formData.advanceRent) || 0,
            agreementDuration: formData.agreementDuration,
          },
        };

      case 'checkout':
        return {
          ...baseData,
          type: 'checkout',
          checkout: {
            exitDate: format(new Date(formData.exitDate), 'dd/MM/yyyy'),
            roomCondition: formData.roomCondition,
            damagesFound: formData.damagesFound,
            depositRefund: parseFloat(formData.depositRefund) || 0,
            duesCleared: formData.duesCleared === 'yes',
            clearanceNotes: formData.clearanceNotes,
          },
        };

      case 'terms':
        return {
          ...baseData,
          type: 'terms',
          terms: {
            sections: [
              {
                title: 'Standard Terms',
                content: [
                  'The tenant agrees to pay rent on or before the due date every month.',
                  'The security deposit will be refunded after deducting any damages or dues.',
                  'The tenant must maintain the property in good condition.',
                  'No illegal activities are allowed on the premises.',
                ],
              },
              {
                title: 'Liability & Responsibilities',
                content: [
                  'The tenant is responsible for any damage caused to the property during their stay.',
                  'The property owner is not liable for any theft or loss of tenant belongings.',
                  'The tenant must ensure proper use of electrical and water facilities.',
                ],
              },
              {
                title: 'Deposit Rules',
                content: [
                  'Security deposit is refundable and will be returned within 30 days of checkout.',
                  'Deductions will be made for any damages, unpaid dues, or cleaning charges.',
                  'Interest will not be paid on the security deposit amount.',
                ],
              },
            ],
          },
        };

      default:
        return baseData as DocumentData;
    }
  };

  const handleGenerateDocument = async () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant');
      return;
    }

    try {
      setLoading(true);
      const data = await getDocumentData(selectedTenant);
      const filename = `${documentType}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;

      downloadPDF(data, filename);
      toast.success('Document generated successfully!');

      await saveDocument(data, filename, selectedTenant);
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (tenants.length === 0) {
      toast.error('No tenants available');
      return;
    }

    try {
      setLoading(true);
      let successCount = 0;

      for (const tenant of tenants) {
        try {
          const data = await getDocumentData(tenant.id);
          const filename = `${documentType}_${tenant.name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
          // save to DB
          await saveDocument(data, filename, tenant.id);
          successCount++;
        } catch (error) {
          console.error(`Error generating document for ${tenant.name}:`, error);
        }
      }

      toast.success(`Generated ${successCount} documents successfully!`);
      setIsBulkDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error in bulk generation:', error);
      toast.error('Bulk generation failed');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (data: DocumentData, title: string, tenantId: string) => {
    try {
      await safeFetch('/documents', {
        method: 'POST',
        body: JSON.stringify({
          tenant_id: tenantId,
          type: documentType,
          title,
          data
        })
      });
    } catch (error) {
      console.error('Error saving document:', error);
      // do not surface failure as fatal; we still generated PDF locally
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await safeFetch(`/documents/${id}`, { method: 'DELETE' });
      toast.success('Document deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownloadDocument = (doc: SavedDocument) => {
    downloadPDF(doc.data, doc.title);
    toast.success('Document downloaded');
  };

  const handlePrintDocument = (doc: SavedDocument) => {
    printPDF(doc.data);
    toast.success('Opening print dialog...');
  };

  const handleShareDocument = async (doc: SavedDocument) => {
    try {
      const shared = await sharePDF(doc.data, doc.title);
      if (shared) {
        toast.success('Document shared');
      } else {
        toast.error('Share failed or canceled');
      }
    } catch (err) {
      console.error('Share failed', err);
      toast.error('Share failed');
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'receipt': return <Receipt className="h-5 w-5" />;
      case 'checkin': return <ClipboardList className="h-5 w-5" />;
      case 'checkout': return <LogOut className="h-5 w-5" />;
      case 'terms': return <FileCheck className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tenants?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tenants?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (doc: SavedDocument) => (
        <div className="flex items-center gap-2">
          {getDocumentIcon(doc.type)}
          <span className="capitalize">{doc.type}</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'tenants.name',
      label: 'Tenant',
      render: (doc: SavedDocument) => (
        <div>
          <p className="font-medium">{doc.tenants?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{doc.tenants?.email}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (doc: SavedDocument) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          {format(new Date(doc.created_at), 'dd MMM yyyy, hh:mm a')}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (doc: SavedDocument) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadDocument(doc)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePrintDocument(doc)}
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShareDocument(doc)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteDocument(doc.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-2">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Center</h1>
          <p className="text-gray-600">Manage all documents for tenants and properties</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/admin/templates'}
        >
          <Edit className="h-4 w-4 mr-2 " />
          Manage Templates
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
  {/* Total Documents */}
  <Card className="rounded-xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Total Documents
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">0</div>
        <TrendingUp className="h-9 w-10 text-green-500 bg-green-50" />
      </div>
    </CardContent>
  </Card>

  {/* Receipts */}
  <Card className="rounded-xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Receipts
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">0</div>
        <TrendingUp className="h-10 w-9 text-blue-500 bg-blue-50" />
      </div>
    </CardContent>
  </Card>

  {/* Check-Ins */}
  <Card className="rounded-xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Check-Ins
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">0</div>
        <TrendingUp className="h-10 w-9 text-sky-500 bg-cyan-50" />
      </div>
    </CardContent>
  </Card>

  {/* Check-Outs */}
  <Card className="rounded-xl shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">
        Check-Outs
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">0</div>
        <TrendingUp className="h-10 w-9 text-indigo-500 bg-indigo-50" />
      </div>
    </CardContent>
  </Card>
</div>

      <Card>
        <CardHeader className='bg-blue-100'>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 ">
            <div>
              <CardTitle>All Documents</CardTitle>
              <CardDescription>View and manage all generated documents</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                 <Button className="bg-blue-600 hover:bg-blue-500 text-white">
  <Plus className="mr-2 h-4 w-4" />
  Create Document
</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Document</DialogTitle>
                    <DialogDescription>Generate a document for a tenant</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Tenant</Label>
                      <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name} - {tenant.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Document Type</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          variant={documentType === 'receipt' ? 'default' : 'outline'}
                          onClick={() => setDocumentType('receipt')}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          Receipt
                        </Button>
                        <Button
                          variant={documentType === 'checkin' ? 'default' : 'outline'}
                          onClick={() => setDocumentType('checkin')}
                        >
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Check-In
                        </Button>
                        <Button
                          variant={documentType === 'checkout' ? 'default' : 'outline'}
                          onClick={() => setDocumentType('checkout')}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Check-Out
                        </Button>
                        <Button
                          variant={documentType === 'terms' ? 'default' : 'outline'}
                          onClick={() => setDocumentType('terms')}
                        >
                          <FileCheck className="mr-2 h-4 w-4" />
                          Terms & Conditions
                        </Button>
                      </div>
                    </div>

                    {documentType === 'receipt' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Amount (₹)</Label>
                            <Input
                              type="number"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Payment Date</Label>
                            <Input
                              type="date"
                              value={formData.paymentDate}
                              onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Payment Method</Label>
                            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="upi">UPI</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Payment Type</Label>
                            <Select value={formData.paymentType} onValueChange={(value) => setFormData({ ...formData, paymentType: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rent">Rent</SelectItem>
                                <SelectItem value="deposit">Security Deposit</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}

                    {documentType === 'checkin' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Security Deposit (₹)</Label>
                            <Input
                              type="number"
                              value={formData.securityDeposit}
                              onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Advance Rent (₹)</Label>
                            <Input
                              type="number"
                              value={formData.advanceRent}
                              onChange={(e) => setFormData({ ...formData, advanceRent: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {documentType === 'checkout' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Exit Date</Label>
                            <Input
                              type="date"
                              value={formData.exitDate}
                              onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Deposit Refund (₹)</Label>
                            <Input
                              type="number"
                              value={formData.depositRefund}
                              onChange={(e) => setFormData({ ...formData, depositRefund: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <Button onClick={handleGenerateDocument} className="w-full" disabled={loading}>
                      <Download className="mr-2 h-4 w-4" />
                      Generate & Download
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Bulk Generate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Document Generation</DialogTitle>
                    <DialogDescription>
                      Generate documents for all active tenants
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Document Type</Label>
                      <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="receipt">Receipt</SelectItem>
                          <SelectItem value="checkin">Check-In Form</SelectItem>
                          <SelectItem value="checkout">Check-Out Form</SelectItem>
                          <SelectItem value="terms">Terms & Conditions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-gray-600">
                      This will generate {documentType} documents for all {tenants.length} active tenants.
                    </p>
                    <Button onClick={handleBulkGenerate} className="w-full" disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate {tenants.length} Documents
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, tenant name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 ">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="checkin">Check-In</SelectItem>
                  <SelectItem value="checkout">Check-Out</SelectItem>
                  <SelectItem value="terms">Terms & Conditions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading documents...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No documents found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first document to see it here</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredDocuments}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
