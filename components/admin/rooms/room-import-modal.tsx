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

interface RoomImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  importing: boolean;
}

export default function RoomImportModal({
  isOpen,
  onClose,
  onImport,
  importing
}: RoomImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const templateData = [
      {
        'Property ID': '1',
        'Property Name': 'Sunrise Apartments',
        'Room Number': '101',
        'Sharing Type': 'single',
        'Room Type': 'Standard',
        'Total Beds': '1',
        'Rent Per Bed': '12000',
        'Floor': '1',
        'Has Attached Bathroom': 'Yes',
        'Has Balcony': 'Yes',
        'Has AC': 'No',
        'Gender Preference': 'male_only',
        'Allow Couples': 'No',
        'Description': 'Cozy single room with window',
        'Amenities': 'WiFi,TV,Study Table',
        'Status': 'Active'
      },
      {
        'Property ID': '1',
        'Property Name': 'Sunrise Apartments',
        'Room Number': '102',
        'Sharing Type': 'double',
        'Room Type': 'Deluxe',
        'Total Beds': '2',
        'Rent Per Bed': '8000',
        'Floor': '1',
        'Has Attached Bathroom': 'Yes',
        'Has Balcony': 'No',
        'Has AC': 'Yes',
        'Gender Preference': 'female_only',
        'Allow Couples': 'No',
        'Description': 'Spacious room with two beds',
        'Amenities': 'WiFi,AC,Study Table,Wardrobe',
        'Status': 'Active'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Property ID
      { wch: 25 }, // Property Name
      { wch: 12 }, // Room Number
      { wch: 15 }, // Sharing Type
      { wch: 15 }, // Room Type
      { wch: 10 }, // Total Beds
      { wch: 12 }, // Rent Per Bed
      { wch: 8 },  // Floor
      { wch: 20 }, // Has Attached Bathroom
      { wch: 15 }, // Has Balcony
      { wch: 10 }, // Has AC
      { wch: 20 }, // Gender Preference
      { wch: 15 }, // Allow Couples
      { wch: 30 }, // Description
      { wch: 40 }, // Amenities
      { wch: 10 }  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rooms');
    
    const filename = 'room_import_template.xlsx';
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
            Import Rooms
          </DialogTitle>
          <DialogDescription>
            Upload Excel file with room data
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