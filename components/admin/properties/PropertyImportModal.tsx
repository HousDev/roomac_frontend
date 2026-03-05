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

interface PropertyImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  importing: boolean;
}

export default function PropertyImportModal({
  isOpen,
  onClose,
  onImport,
  importing
}: PropertyImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const templateData = [
      {
        'Property Name': 'Sunrise Apartments',
        'Property Type': 'Residential',
        'Property Subtype': 'Apartment',
        'City': 'Mumbai',
        'State': 'Maharashtra',
        'Area': 'Bandra West',
        'Address': '123 Linking Road',
        'Total Rooms': '10',
        'Total Beds': '20',
        'Floor': '12',
        'Starting Price': '25000',
        'Security Deposit': '50000',
        'Description': 'Luxury apartment with sea view',
        'Property Manager Name': 'John Doe',
        'Property Manager Phone': '9876543210',
        'Property Manager Email': 'john@example.com',
        'Lock-in Period Months': '12',
        'Lock-in Penalty Amount': '5000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period Days': '30',
        'Notice Penalty Amount': '2000',
        'Notice Penalty Type': 'fixed',
        'Status': 'Active',
        'Tags': 'Luxury,Sea View,Family'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Property Name
      { wch: 15 }, // Property Type
      { wch: 18 }, // Property Subtype
      { wch: 15 }, // City
      { wch: 15 }, // State
      { wch: 15 }, // Area
      { wch: 30 }, // Address
      { wch: 12 }, // Total Rooms
      { wch: 12 }, // Total Beds
      { wch: 10 }, // Floor
      { wch: 15 }, // Starting Price
      { wch: 15 }, // Security Deposit
      { wch: 30 }, // Description
      { wch: 20 }, // Property Manager Name
      { wch: 15 }, // Property Manager Phone
      { wch: 25 }, // Property Manager Email
      { wch: 18 }, // Lock-in Period Months
      { wch: 18 }, // Lock-in Penalty Amount
      { wch: 18 }, // Lock-in Penalty Type
      { wch: 15 }, // Notice Period Days
      { wch: 18 }, // Notice Penalty Amount
      { wch: 18 }, // Notice Penalty Type
      { wch: 10 }, // Status
      { wch: 30 }  // Tags
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Properties');
    
    const filename = 'property_import_template.xlsx';
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
            Import Properties
          </DialogTitle>
          <DialogDescription>
            Upload Excel file with property data
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