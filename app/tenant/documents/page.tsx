"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, Printer, Share2, Eye, Plus,
  Receipt, ClipboardList, LogOut, Trash2, Calendar, Search as SearchIcon, Filter as FilterIcon
} from "lucide-react";
import { format } from "date-fns";
import { DocumentData, downloadPDF, printPDF, sharePDF } from "@/lib/pdf-generator";
import { toast } from "sonner";
// import TenantHeader from "@/components/layout/tenantHeader";

interface SavedDocument {
  id: string;
  type: string;
  title: string;
  created_at: string;
  data: DocumentData;
}

export default function TenantDocumentsPage() {
  const router = useRouter();

  const [documentType, setDocumentType] = useState<DocumentData["type"]>("receipt");
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [tenantData, setTenantData] = useState<any>(null);
  const [propertyData, setPropertyData] = useState<any>(null);

  const [formData, setFormData] = useState({
    receiptNumber: `REC-${Date.now()}`,
    amount: "",
    paymentDate: format(new Date(), "yyyy-MM-dd"),
    paymentMethod: "cash",
    paymentType: "rent",
    month: format(new Date(), "MMMM yyyy"),
    roomCondition: "Good",
    inventoryItems: "",
    securityDeposit: "",
    advanceRent: "",
    agreementDuration: "12 months",
    exitDate: format(new Date(), "yyyy-MM-dd"),
    damagesFound: "None",
    depositRefund: "",
    duesCleared: "yes",
    clearanceNotes: "All dues cleared. Tenant vacated the premises in good condition.",
    termsStandard: "",
    termsLiability: "",
    termsDeposit: "",
  });

  // helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("tenant_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};


  useEffect(() => {
    loadTenantData();
    loadSavedDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- data loaders using REST API (change endpoints as needed) ---
  const loadTenantData = async () => {
    try {
      const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
      if (!tenantId) {
        router.push("/tenant/login");
        return;
      }

      const res = await fetch(`/api/tenants/${encodeURIComponent(tenantId)}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        console.warn("Failed to load tenant data", await res.text());
        return;
      }

      const t = await res.json();
      setTenantData(t);
      setPropertyData(t.properties || null);
    } catch (err) {
      console.error("Error loading tenant data:", err);
    }
  };

  const loadSavedDocuments = async () => {
    try {
      setLoading(true);
      const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
      if (!tenantId) {
        setSavedDocuments([]);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/documents?tenant_id=${encodeURIComponent(tenantId)}&order=created_at.desc`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        console.error("Failed to load documents", await res.text());
        setSavedDocuments([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setSavedDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- build document payload used by pdf-generator ---
  const getDocumentData = (): DocumentData => {
    const baseData = {
      property: {
        name: propertyData?.name || "Property Name",
        address: propertyData?.address || "Property Address",
        phone: propertyData?.manager_phone || "+91 9876543210",
        email: propertyData?.manager_email || "info@property.com",
      },
      tenant: {
        name: tenantData?.name || "Tenant Name",
        email: tenantData?.email || "tenant@example.com",
        phone: tenantData?.phone || "+91 0000000000",
        roomNumber: tenantData?.rooms?.room_number || "N/A",
        checkInDate: tenantData?.check_in_date ? format(new Date(tenantData.check_in_date), "dd/MM/yyyy") : format(new Date(), "dd/MM/yyyy"),
      },
    };

    switch (documentType) {
      case "receipt":
        return {
          ...baseData,
          type: "receipt",
          payment: {
            receiptNumber: formData.receiptNumber,
            amount: parseFloat(formData.amount) || 0,
            paymentDate: format(new Date(formData.paymentDate), "dd/MM/yyyy"),
            paymentMethod: formData.paymentMethod,
            paymentType: formData.paymentType,
            month: formData.month,
          },
        };

      case "checkin":
        return {
          ...baseData,
          type: "checkin",
          checkin: {
            roomCondition: formData.roomCondition,
            inventoryList: formData.inventoryItems.split("\n").filter((i) => i.trim()),
            securityDeposit: parseFloat(formData.securityDeposit) || 0,
            advanceRent: parseFloat(formData.advanceRent) || 0,
            agreementDuration: formData.agreementDuration,
          },
        };

      case "checkout":
        return {
          ...baseData,
          type: "checkout",
          checkout: {
            exitDate: format(new Date(formData.exitDate), "dd/MM/yyyy"),
            roomCondition: formData.roomCondition,
            damagesFound: formData.damagesFound,
            depositRefund: parseFloat(formData.depositRefund) || 0,
            duesCleared: formData.duesCleared === "yes",
            clearanceNotes: formData.clearanceNotes,
          },
        };

      case "terms":
        return {
          ...baseData,
          type: "terms",
          terms: {
            sections: [
              {
                title: "Standard Terms",
                content:
                  formData.termsStandard.split("\n").filter((i) => i.trim()).length > 0
                    ? formData.termsStandard.split("\n").filter((i) => i.trim())
                    : [
                      "The tenant agrees to pay rent on or before the due date every month.",
                      "The security deposit will be refunded after deducting any damages or dues.",
                      "The tenant must maintain the property in good condition.",
                      "No illegal activities are allowed on the premises.",
                    ],
              },
              {
                title: "Liability & Responsibilities",
                content:
                  formData.termsLiability.split("\n").filter((i) => i.trim()).length > 0
                    ? formData.termsLiability.split("\n").filter((i) => i.trim())
                    : [
                      "The tenant is responsible for any damage caused to the property during their stay.",
                      "The property owner is not liable for any theft or loss of tenant belongings.",
                      "The tenant must ensure proper use of electrical and water facilities.",
                    ],
              },
              {
                title: "Deposit Rules",
                content:
                  formData.termsDeposit.split("\n").filter((i) => i.trim()).length > 0
                    ? formData.termsDeposit.split("\n").filter((i) => i.trim())
                    : [
                      "Security deposit is refundable and will be returned within 30 days of checkout.",
                      "Deductions will be made for any damages, unpaid dues, or cleaning charges.",
                      "Interest will not be paid on the security deposit amount.",
                    ],
              },
            ],
          },
        };

      default:
        return baseData as DocumentData;
    }
  };

  // --- actions: generate / print / share / save / delete using REST ---
  const handleGenerateDocument = async () => {
    try {
      const data = getDocumentData();
      const filename = `${documentType}_${format(new Date(), "yyyy-MM-dd_HHmm")}.pdf`;
      downloadPDF(data, filename);
      toast.success("Document generated successfully!");
      await saveDocument(data, filename);
    } catch (err) {
      console.error("Error generating document:", err);
      toast.error("Failed to generate document");
    }
  };

  const handlePrint = () => {
    try {
      const data = getDocumentData();
      printPDF(data);
      toast.success("Opening print dialog...");
    } catch (err) {
      console.error("Error printing:", err);
      toast.error("Failed to print document");
    }
  };

  const handleShare = async () => {
    try {
      const data = getDocumentData();
      const filename = `${documentType}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      const shared = await sharePDF(data, filename);
      if (shared) toast.success("Document shared successfully!");
    } catch (err) {
      console.error("Error sharing:", err);
      toast.error("Failed to share document");
    }
  };

  const saveDocument = async (data: DocumentData, title: string) => {
    try {
      const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") : null;
      if (!tenantId) {
        toast.error("Tenant not authenticated.");
        return;
      }

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tenant_id: tenantId,
          type: documentType,
          title,
          data,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save document", await res.text());
        toast.error("Failed to save document");
        return;
      }

      toast.success("Document saved to history");
      await loadSavedDocuments();
    } catch (err) {
      console.error("Error saving document:", err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const ok = confirm("Are you sure you want to delete this document?");
      if (!ok) return;

      const res = await fetch(`/api/documents/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        console.error("Failed to delete document", await res.text());
        toast.error("Failed to delete document");
        return;
      }

      toast.success("Document deleted");
      await loadSavedDocuments();
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <Receipt className="h-5 w-5" />;
      case "checkin":
        return <ClipboardList className="h-5 w-5" />;
      case "checkout":
        return <LogOut className="h-5 w-5" />;
      case "terms":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div>
      {/* <TenantHeader /> */}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Document Management</h1>
          <p className="text-gray-600">Create, manage, and download your documents</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            {/* <TabsTrigger value="create">Create New Document</TabsTrigger> */}
            <TabsTrigger value="history">Document History</TabsTrigger>
          </TabsList>

          {/* <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Document</CardTitle>
                <CardDescription>Choose a document type and fill in the details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant={documentType === "receipt" ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setDocumentType("receipt")}
                  >
                    <Receipt className="h-8 w-8" />
                    <span>Receipt</span>
                  </Button>
                  <Button
                    variant={documentType === "checkin" ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setDocumentType("checkin")}
                  >
                    <ClipboardList className="h-8 w-8" />
                    <span>Check-In</span>
                  </Button>
                  <Button
                    variant={documentType === "checkout" ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setDocumentType("checkout")}
                  >
                    <LogOut className="h-8 w-8" />
                    <span>Check-Out</span>
                  </Button>
                  <Button
                    variant={documentType === "terms" ? "default" : "outline"}
                    className="h-24 flex flex-col items-center justify-center gap-2"
                    onClick={() => setDocumentType("terms")}
                  >
                    <FileText className="h-8 w-8" />
                    <span>Terms & Conditions</span>
                  </Button>
                </div>

                {documentType === "receipt" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Receipt Number</Label>
                        <Input value={formData.receiptNumber} onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })} />
                      </div>
                      <div>
                        <Label>Amount (₹)</Label>
                        <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="Enter amount" />
                      </div>
                      <div>
                        <Label>Payment Date</Label>
                        <Input type="date" value={formData.paymentDate} onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })} />
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
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
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rent">Rent</SelectItem>
                            <SelectItem value="deposit">Security Deposit</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Payment Month</Label>
                        <Input value={formData.month} onChange={(e) => setFormData({ ...formData, month: e.target.value })} placeholder="e.g., December 2025" />
                      </div>
                    </div>
                  </div>
                )}

                {documentType === "checkin" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Room Condition</Label>
                        <Select value={formData.roomCondition} onValueChange={(value) => setFormData({ ...formData, roomCondition: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Agreement Duration</Label>
                        <Input value={formData.agreementDuration} onChange={(e) => setFormData({ ...formData, agreementDuration: e.target.value })} />
                      </div>
                      <div>
                        <Label>Security Deposit (₹)</Label>
                        <Input type="number" value={formData.securityDeposit} onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })} />
                      </div>
                      <div>
                        <Label>Advance Rent (₹)</Label>
                        <Input type="number" value={formData.advanceRent} onChange={(e) => setFormData({ ...formData, advanceRent: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Inventory Items (one per line)</Label>
                      <Textarea rows={6} value={formData.inventoryItems} onChange={(e) => setFormData({ ...formData, inventoryItems: e.target.value })} placeholder={"Bed\nMattress\nStudy Table\nChair\nWardrobe"} />
                    </div>
                  </div>
                )}

                {documentType === "checkout" && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Exit Date</Label>
                        <Input type="date" value={formData.exitDate} onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })} />
                      </div>
                      <div>
                        <Label>Room Condition</Label>
                        <Select value={formData.roomCondition} onValueChange={(value) => setFormData({ ...formData, roomCondition: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Damaged">Damaged</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Damages Found</Label>
                        <Input value={formData.damagesFound} onChange={(e) => setFormData({ ...formData, damagesFound: e.target.value })} placeholder="None or describe damages" />
                      </div>
                      <div>
                        <Label>Deposit Refund (₹)</Label>
                        <Input type="number" value={formData.depositRefund} onChange={(e) => setFormData({ ...formData, depositRefund: e.target.value })} />
                      </div>
                      <div>
                        <Label>Dues Cleared?</Label>
                        <Select value={formData.duesCleared} onValueChange={(value) => setFormData({ ...formData, duesCleared: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Clearance Notes</Label>
                      <Textarea rows={4} value={formData.clearanceNotes} onChange={(e) => setFormData({ ...formData, clearanceNotes: e.target.value })} />
                    </div>
                  </div>
                )}

                {documentType === "terms" && (
                  <div className="space-y-4">
                    <div>
                      <Label>Standard Terms (one per line)</Label>
                      <Textarea rows={5} value={formData.termsStandard} onChange={(e) => setFormData({ ...formData, termsStandard: e.target.value })} placeholder="Enter standard terms and conditions..." />
                    </div>
                    <div>
                      <Label>Liability & Responsibilities (one per line)</Label>
                      <Textarea rows={5} value={formData.termsLiability} onChange={(e) => setFormData({ ...formData, termsLiability: e.target.value })} placeholder="Enter liability terms..." />
                    </div>
                    <div>
                      <Label>Deposit Rules (one per line)</Label>
                      <Textarea rows={5} value={formData.termsDeposit} onChange={(e) => setFormData({ ...formData, termsDeposit: e.target.value })} placeholder="Enter deposit rules..." />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleGenerateDocument} size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Generate & Download
                  </Button>
                  <Button onClick={handlePrint} variant="outline" size="lg">
                    <Printer className="mr-2 h-5 w-5" />
                    Print
                  </Button>
                  <Button onClick={handleShare} variant="outline" size="lg">
                    <Share2 className="mr-2 h-5 w-5" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document History</CardTitle>
                <CardDescription>View and manage your previously generated documents</CardDescription>
              </CardHeader>
              <CardContent>
                {savedDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No documents found</p>
                    <p className="text-sm text-gray-400 mt-2">Generate your first document to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedDocuments.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-100 rounded-lg">{getDocumentIcon(doc.type)}</div>
                              <div>
                                <h4 className="font-semibold">{doc.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(doc.created_at), "dd MMM yyyy, hh:mm a")}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => downloadPDF(doc.data, doc.title)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => printPDF(doc.data)}>
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => sharePDF(doc.data, doc.title)}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </div>
  );
}
