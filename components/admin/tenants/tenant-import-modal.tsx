"use client";

import { useState, useRef } from "react";
import { Upload, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';

interface TenantImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  importing: boolean;
}

export default function TenantImportModal({
  isOpen,
  onClose,
  onImport,
  importing
}: TenantImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const templateData = [
      {
        'Salutation': 'Mr.',
        'Full Name': 'Rajesh Kumar',
        'Email': 'rajesh.kumar@example.com',
        'Country Code': '+91',
        'Phone': '9876543210',
        'Gender': 'Male',
        'Date of Birth': '1990-01-15',
        'Occupation Category': 'Service',
        'Exact Occupation': 'Software Engineer at Tech Corp',
        'Address': '123, Green Park Extension',
        'City': 'Delhi',
        'State': 'Delhi',
        'Pincode': '110016',
        'Emergency Contact Name': 'Priya Kumar',
        'Emergency Contact Phone': '9876543211',
        'Emergency Contact Relation': 'Spouse',
        'Preferred Sharing': 'double',
        'Preferred Room Type': 'AC',
        'Preferred Property ID': '1',
        'Check-in Date': '2024-04-01',
        'Portal Access': 'Yes',
        'Status': 'Active',
        'Lock-in Period (months)': '12',
        'Lock-in Penalty Amount': '5000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period (days)': '30',
        'Notice Penalty Amount': '2000',
        'Notice Penalty Type': 'fixed'
      },
      {
        'Salutation': 'Ms.',
        'Full Name': 'Priya Sharma',
        'Email': 'priya.sharma@example.com',
        'Country Code': '+91',
        'Phone': '9876543212',
        'Gender': 'Female',
        'Date of Birth': '1995-06-20',
        'Occupation Category': 'Student',
        'Exact Occupation': 'MBA Student at Delhi University',
        'Address': '456, Hauz Khas Village',
        'City': 'Delhi',
        'State': 'Delhi',
        'Pincode': '110016',
        'Emergency Contact Name': 'Amit Sharma',
        'Emergency Contact Phone': '9876543213',
        'Emergency Contact Relation': 'Brother',
        'Preferred Sharing': 'single',
        'Preferred Room Type': 'Non-AC',
        'Preferred Property ID': '2',
        'Check-in Date': '2024-04-15',
        'Portal Access': 'Yes',
        'Status': 'Active',
        'Lock-in Period (months)': '6',
        'Lock-in Penalty Amount': '3000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period (days)': '15',
        'Notice Penalty Amount': '1000',
        'Notice Penalty Type': 'fixed'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Salutation
      { wch: 25 }, // Full Name
      { wch: 30 }, // Email
      { wch: 12 }, // Country Code
      { wch: 15 }, // Phone
      { wch: 10 }, // Gender
      { wch: 15 }, // Date of Birth
      { wch: 20 }, // Occupation Category
      { wch: 30 }, // Exact Occupation
      { wch: 30 }, // Address
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 10 }, // Pincode
      { wch: 20 }, // Emergency Contact Name
      { wch: 15 }, // Emergency Contact Phone
      { wch: 15 }, // Emergency Contact Relation
      { wch: 15 }, // Preferred Sharing
      { wch: 15 }, // Preferred Room Type
      { wch: 18 }, // Preferred Property ID
      { wch: 15 }, // Check-in Date
      { wch: 12 }, // Portal Access
      { wch: 10 }, // Status
      { wch: 18 }, // Lock-in Period (months)
      { wch: 20 }, // Lock-in Penalty Amount
      { wch: 20 }, // Lock-in Penalty Type
      { wch: 18 }, // Notice Period (days)
      { wch: 20 }, // Notice Penalty Amount
      { wch: 20 }  // Notice Penalty Type
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tenants');
    
    const filename = 'tenant_import_template.xlsx';
    XLSX.writeFile(wb, filename);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }
    try {
      await onImport(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Import Tenants
          </DialogTitle>
          <DialogDescription>
            Upload Excel file with tenant data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Template Download */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <button
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
            >
              <Download size={16} />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="w-full text-sm border rounded p-2"
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={importing}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {importing ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}