"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Mail,
  MessageCircle,
  X,
  FileText,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface LedgerReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: {
    id: number;
    name: string;
    phone: string;
    email: string;
    salutation: string;
    country_code: string;
    room_number?: string;
    bed_number?: number;
    property_name?: string;
    monthly_rent?: number;
    check_in_date?: string;
    security_deposit?: number;
  };
  siteName: string;
  siteTagline: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  companyLogo: string | null;
}

export function LedgerReportDialog({
  open,
  onOpenChange,
  tenant,
  siteName,
  siteTagline,
  contactAddress,
  contactPhone,
  contactEmail,
  companyLogo,
}: LedgerReportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Fetch PDF when dialog opens
  useEffect(() => {
    if (open && tenant?.id) {
      fetchPDF();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [open, tenant?.id]);

  const fetchPDF = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/ledger/${tenant.id}/preview`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      toast.error("Failed to load ledger report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/payments/ledger/${tenant.id}/download`
      );
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ledger-${tenant.name.replace(/\s/g, '_')}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmail = () => {
    if (!tenant.email) {
      toast.error("Tenant email not available");
      return;
    }
    const subject = encodeURIComponent(`Payment Ledger - ${tenant.name}`);
    const body = encodeURIComponent(
      `Dear ${tenant.salutation} ${tenant.name},\n\nPlease find attached your payment ledger report.\n\nThank you,\n${siteName}`
    );
    window.open(`mailto:${tenant.email}?subject=${subject}&body=${body}`);
    toast.success("Email client opened. Please attach the PDF manually.");
  };

  const handleWhatsApp = () => {
    const phoneNumber = `${tenant.country_code}${tenant.phone}`;
    const message = encodeURIComponent(
      `Dear ${tenant.salutation} ${tenant.name},\n\nPlease find your payment ledger report attached.\n\nThank you,\n${siteName}`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
    toast.info("Please attach the PDF manually after downloading");
  };

  if (!tenant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-gradient-to-r from-[#3381e6] to-[#175cde] w-[95vw] h-[85vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-1 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex text-md text-white items-center gap-2">
              <FileText className="h-5 w-5  text-white" />
              Tenant Ledger Report - {tenant.salutation} {tenant.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button size="sm"  variant="outline" onClick={handleDownload} disabled={isLoading}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button size="sm" variant="outline" onClick={handleEmail}>
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button size="sm" variant="outline" onClick={handleWhatsApp}>
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer - Main Content (NO NEW TAB) */}
        <div className="flex-1 min-h-0 bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Generating report...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="Ledger Report"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No report available</p>
                <Button variant="outline" size="sm" onClick={fetchPDF} className="mt-2">
                  <Eye className="h-4 w-4 mr-2" />
                  Load Report
                </Button>
              </div>
            </div>
          )}
        </div>

        
      </DialogContent>
    </Dialog>
  );
}