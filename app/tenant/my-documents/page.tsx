"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { downloadPDF, printPDF, sharePDF } from "@/lib/pdf-generator";
import {
  FileText,
  Receipt,
  FileCheck,
  FileSignature,
  ClipboardList,
  Download,
  Printer,
  Share2,
  ArrowLeft,
  Search,
  Filter,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
// import TenantHeader from "@/components/layout/tenantHeader";

interface SavedDocument {
  id: string;
  tenant_id: string;
  type: string;
  title: string;
  data: any;
  created_at: string;
}

export default function MyDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [tenantId, setTenantId] = useState<string | null>(null);

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
    checkAuthAndLoadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [documents, searchTerm, filterType]);

  const checkAuthAndLoadDocuments = async () => {
    try {
      const id = localStorage.getItem("tenant_id");

      if (!id) {
        router.push("/tenant/login");
        return;
      }

      setTenantId(id);
      await loadDocuments(id);
    } catch (error) {
      console.error("Auth Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (userId: string) => {
    try {
      const res = await fetch(`/api/documents?tenant_id=${userId}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...documents];

    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter((doc) => doc.type === filterType);
    }

    setFilteredDocuments(filtered);
  };

  const handleDownload = (doc: SavedDocument) => {
    downloadPDF(doc.data, doc.title);
  };

  const handlePrint = (doc: SavedDocument) => {
    printPDF(doc.data);
  };

  const handleShare = async (doc: SavedDocument) => {
    await sharePDF(doc.data, doc.title);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <Receipt className="h-6 w-6 text-blue-600" />;
      case "checkin":
        return <FileCheck className="h-6 w-6 text-green-600" />;
      case "checkout":
        return <FileSignature className="h-6 w-6 text-orange-600" />;
      case "terms":
        return <ClipboardList className="h-6 w-6 text-purple-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDocumentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      receipt: "bg-blue-100 text-blue-800",
      checkin: "bg-green-100 text-green-800",
      checkout: "bg-orange-100 text-orange-800",
      terms: "bg-purple-100 text-purple-800",
    };

    return <Badge className={colors[type] || "bg-gray-100 text-gray-800"}>{type.toUpperCase()}</Badge>;
  };

  const stats = {
    total: documents.length,
    receipts: documents.filter((d) => d.type === "receipt").length,
    checkin: documents.filter((d) => d.type === "checkin").length,
    checkout: documents.filter((d) => d.type === "checkout").length,
    terms: documents.filter((d) => d.type === "terms").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* <TenantHeader /> */}
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          {/* <Button variant="outline" onClick={() => router.push("/tenant/portal")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button> */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-600 mt-1">View and manage all your documents</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Receipts</p><p className="text-2xl font-bold text-blue-600">{stats.receipts}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Check-In</p><p className="text-2xl font-bold text-green-600">{stats.checkin}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Check-Out</p><p className="text-2xl font-bold text-orange-600">{stats.checkout}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-gray-600">Terms</p><p className="text-2xl font-bold text-purple-600">{stats.terms}</p></CardContent></Card>
        </div>

        {/* Document List */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Library</CardTitle>
            <CardDescription>All your documents in one place</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="receipt">Receipts</SelectItem>
                  <SelectItem value="checkin">Check-In</SelectItem>
                  <SelectItem value="checkout">Check-Out</SelectItem>
                  <SelectItem value="terms">Terms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Documents */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No documents found</p>
                <p className="text-sm">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your filters"
                    : "Your documents will appear here once created"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredDocuments.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">{getDocumentIcon(doc.type)}</div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold">{doc.title}</h3>
                              {getDocumentTypeBadge(doc.type)}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                                <Download className="h-4 w-4 mr-1" /> Download
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handlePrint(doc)}>
                                <Printer className="h-4 w-4 mr-1" /> Print
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleShare(doc)}>
                                <Share2 className="h-4 w-4 mr-1" /> Share
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(doc.created_at), "dd MMM yyyy, hh:mm a")}
                          </div>

                          {doc.data && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-semibold">Details:</span>{" "}
                                {doc.data.propertyName && `${doc.data.propertyName} - `}
                                {doc.data.roomNumber && `Room ${doc.data.roomNumber}`}
                                {doc.data.amount && ` - ₹${doc.data.amount}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
