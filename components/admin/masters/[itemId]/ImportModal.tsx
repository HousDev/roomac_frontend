"use client";

import { useState, useRef } from "react";
import { Upload, Download, X } from "lucide-react";
import * as XLSX from 'xlsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  importing: boolean;
  masterItemName: string;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImport,
  importing,
  masterItemName
}: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const templateData = [
      {
        'Name': 'Example 1',
        'Status': 'Active'
      },
      {
        'Name': 'Example 2',
        'Status': 'Inactive'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    const filename = `${masterItemName.toLowerCase().replace(/\s+/g, '_')}_template.xlsx`;
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Import Values</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Template Download */}
          <div className="mb-4">
            <button
              onClick={downloadTemplate}
              className="bg-blue-800 text-white text-blue-600 hover:text-blue-800 hover:bg-white text-sm flex items-center gap-1 px-2 py-2"
            >
              <Download size={14} />
              Download Template
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="w-full text-sm border rounded p-1"
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Sample Format */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <p className="font-medium mb-1">Required columns:</p>
            <p><span className="text-red-500">*</span> Name (required)</p>
            <p><span className="text-red-500">*</span> Status (required: Active/Inactive)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
            disabled={importing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!selectedFile || importing}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-1"
          >
            {importing ? (
              <>
                <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload size={14} />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}