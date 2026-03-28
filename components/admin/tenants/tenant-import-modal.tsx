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
        // Example 1: Individual Tenant (Service)
        'Salutation': 'Mr',
        'Full Name': 'Rajesh Kumar',
        'Email': 'rajesh.kumar@example.com',
        'Phone': '+919876543210',
        'Gender': 'Male',
        'Date of Birth': '15/01/1990',
        'Occupation Category': 'Service',
        'Exact Occupation': 'Software Engineer at Tech Corp',
        'Occupation': 'Software Engineer',
        'Organization': 'Tech Corp',
        'Years of Experience': '5',
        'Monthly Income': '75000',
        'Course Duration': '',
        'Student ID': '',
        'Employee ID': 'EMP12345',
        'Portfolio URL': 'https://portfolio.example.com/rajesh',
        'Work Mode': 'Hybrid',
        'Shift Timing': 'Day',
        'Address': '123, Green Park Extension',
        'City': 'Delhi',
        'State': 'Delhi',
        'Pincode': '110016',
        'Emergency Contact Name': 'Priya Kumar',
        'Emergency Contact Phone': '+919876543211',
        'Emergency Contact Relation': 'Spouse',
        'Preferred Sharing': 'double',
        'Preferred Room Type': 'AC',
        'Preferred Property ID': '1',
        'Check-in Date': '01/04/2024',
        'Portal Access': '1',
        'Status': '1',
        'Lock-in Period (months)': '12',
        'Lock-in Penalty Amount': '5000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period (days)': '30',
        'Notice Penalty Amount': '2000',
        'Notice Penalty Type': 'fixed',
        // Partner fields (empty for individual)
        'Partner Full Name': '',
        'Partner Phone': '',
        'Partner Date of Birth': '',
        'Partner Gender': '',
        'Partner Email': '',
        'Partner Occupation': '',
        'Partner Organization': '',
        'Partner Relationship': '',
        'Partner Address': '',
        'Partner City': '',
        'Partner State': '',
        'Partner Pincode': '',
        'Is Couple Booking': 'No',
        // Document URLs
        'ID Proof URL': 'https://storage.example.com/id_proofs/rajesh_aadhar.pdf',
        'Address Proof URL': 'https://storage.example.com/address_proofs/rajesh_electricity.pdf',
        'Photo URL': 'https://storage.example.com/photos/rajesh.jpg',
        'Aadhar Number': '1234-5678-9012',
        'PAN Number': 'ABCDE1234F',
        'ID Proof Type': 'aadhar_card',
        'Address Proof Type': 'electricity_bill',
        'Partner ID Proof URL': '',
        'Partner ID Proof Type': '',
        'Partner Address Proof URL': '',
        'Partner Address Proof Type': '',
        'Partner Photo URL': '',
        'Additional Documents': JSON.stringify([
          {
            type: 'qualification_certificate',
            url: 'https://storage.example.com/docs/rajesh_degree.pdf',
            name: 'Bachelor Degree Certificate'
          }
        ])
      },
      {
        // Example 2: Individual Tenant (Student)
        'Salutation': 'Ms',
        'Full Name': 'Priya Sharma',
        'Email': 'priya.sharma@example.com',
        'Phone': '+919876543212',
        'Gender': 'Female',
        'Date of Birth': '20/06/1995',
        'Occupation Category': 'Student',
        'Exact Occupation': 'MBA Student at Delhi University',
        'Occupation': 'Student',
        'Organization': 'Delhi University',
        'Years of Experience': '',
        'Monthly Income': '',
        'Course Duration': '2 years',
        'Student ID': 'DU2023MBA123',
        'Employee ID': '',
        'Portfolio URL': '',
        'Work Mode': '',
        'Shift Timing': '',
        'Address': '456, Hauz Khas Village',
        'City': 'Delhi',
        'State': 'Delhi',
        'Pincode': '110016',
        'Emergency Contact Name': 'Amit Sharma',
        'Emergency Contact Phone': '+919876543213',
        'Emergency Contact Relation': 'Brother',
        'Preferred Sharing': 'single',
        'Preferred Room Type': 'Non-AC',
        'Preferred Property ID': '2',
        'Check-in Date': '15/04/2024',
        'Portal Access': '1',
        'Status': '1',
        'Lock-in Period (months)': '6',
        'Lock-in Penalty Amount': '3000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period (days)': '15',
        'Notice Penalty Amount': '1000',
        'Notice Penalty Type': 'fixed',
        // Partner fields (empty for individual)
        'Partner Full Name': '',
        'Partner Phone': '',
        'Partner Date of Birth': '',
        'Partner Gender': '',
        'Partner Email': '',
        'Partner Occupation': '',
        'Partner Organization': '',
        'Partner Relationship': '',
        'Partner Address': '',
        'Partner City': '',
        'Partner State': '',
        'Partner Pincode': '',
        'Is Couple Booking': 'No',
        // Document URLs
        'ID Proof URL': 'https://storage.example.com/id_proofs/priya_aadhar.pdf',
        'Address Proof URL': 'https://storage.example.com/address_proofs/priya_rental.pdf',
        'Photo URL': 'https://storage.example.com/photos/priya.jpg',
        'Aadhar Number': '5678-1234-9012',
        'PAN Number': 'FGHIJ5678K',
        'ID Proof Type': 'aadhar_card',
        'Address Proof Type': 'rent_agreement',
        'Partner ID Proof URL': '',
        'Partner ID Proof Type': '',
        'Partner Address Proof URL': '',
        'Partner Address Proof Type': '',
        'Partner Photo URL': '',
        'Additional Documents': JSON.stringify([
          {
            type: 'admission_letter',
            url: 'https://storage.example.com/docs/priya_admission.pdf',
            name: 'University Admission Letter'
          }
        ])
      },
      {
        // Example 3: Couple Booking (Both working professionals)
        'Salutation': 'Mr',
        'Full Name': 'Amit Singh',
        'Email': 'amit.singh@example.com',
        'Phone': '+919876543214',
        'Gender': 'Male',
        'Date of Birth': '10/03/1988',
        'Occupation Category': 'Service',
        'Exact Occupation': 'Senior Developer at Google',
        'Occupation': 'Software Developer',
        'Organization': 'Google',
        'Years of Experience': '8',
        'Monthly Income': '120000',
        'Course Duration': '',
        'Student ID': '',
        'Employee ID': 'EMP78901',
        'Portfolio URL': 'https://github.com/amitsingh',
        'Work Mode': 'Work from Office',
        'Shift Timing': 'Day',
        'Address': '789, Indiranagar',
        'City': 'Bangalore',
        'State': 'Karnataka',
        'Pincode': '560038',
        'Emergency Contact Name': 'Rajesh Singh',
        'Emergency Contact Phone': '+919876543215',
        'Emergency Contact Relation': 'Father',
        'Preferred Sharing': 'double',
        'Preferred Room Type': 'AC',
        'Preferred Property ID': '3',
        'Check-in Date': '01/05/2024',
        'Portal Access': '1',
        'Status': '1',
        'Lock-in Period (months)': '12',
        'Lock-in Penalty Amount': '5000',
        'Lock-in Penalty Type': 'fixed',
        'Notice Period (days)': '30',
        'Notice Penalty Amount': '2000',
        'Notice Penalty Type': 'fixed',
        // Partner Information (filled for couple booking)
        'Partner Full Name': 'Neha Singh',
        'Partner Phone': '+919876543216',
        'Partner Date of Birth': '15/07/1990',
        'Partner Gender': 'Female',
        'Partner Email': 'neha.singh@example.com',
        'Partner Occupation': 'Product Manager',
        'Partner Organization': 'Amazon',
        'Partner Relationship': 'Spouse',
        'Partner Address': '789, Indiranagar',
        'Partner City': 'Bangalore',
        'Partner State': 'Karnataka',
        'Partner Pincode': '560038',
        'Is Couple Booking': 'Yes',
        // Document URLs for main tenant
        'ID Proof URL': 'https://storage.example.com/id_proofs/amit_aadhar.pdf',
        'Address Proof URL': 'https://storage.example.com/address_proofs/amit_rental.pdf',
        'Photo URL': 'https://storage.example.com/photos/amit.jpg',
        'Aadhar Number': '9012-3456-7890',
        'PAN Number': 'IJKLM1234N',
        'ID Proof Type': 'aadhar_card',
        'Address Proof Type': 'rent_agreement',
        // Partner documents
        'Partner ID Proof URL': 'https://storage.example.com/id_proofs/neha_aadhar.pdf',
        'Partner ID Proof Type': 'aadhar_card',
        'Partner Address Proof URL': 'https://storage.example.com/address_proofs/neha_rental.pdf',
        'Partner Address Proof Type': 'rent_agreement',
        'Partner Photo URL': 'https://storage.example.com/photos/neha.jpg',
        'Additional Documents': JSON.stringify([
          {
            type: 'marriage_certificate',
            url: 'https://storage.example.com/docs/marriage_certificate.pdf',
            name: 'Marriage Certificate'
          },
          {
            type: 'income_proof',
            url: 'https://storage.example.com/docs/income_proof.pdf',
            name: 'Income Proof'
          }
        ])
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Add dropdown validation for multiple columns
    const validations = {
      // Salutation column
      'A:A': {
        type: 'list',
        values: ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Other']
      },
      // Gender column
      'F:F': {
        type: 'list',
        values: ['Male', 'Female', 'Other', 'Prefer not to say']
      },
      // Work Mode column
      'R:R': {
        type: 'list',
        values: ['Work from Office', 'Work from Home', 'Hybrid']
      },
      // Shift Timing column
      'S:S': {
        type: 'list',
        values: ['Day', 'Night', 'Rotational']
      },
      // Is Couple Booking column
      'AZ:AZ': {
        type: 'list',
        values: ['Yes', 'No']
      },
      // ID Proof Type column
      'BF:BF': {
        type: 'list',
        values: ['aadhar_card', 'pan_card', 'passport', 'voter_id', 'driving_license']
      },
      // Address Proof Type column
      'BG:BG': {
        type: 'list',
        values: ['electricity_bill', 'water_bill', 'rent_agreement', 'bank_statement', 'aadhar_card']
      },
      // Partner Gender column
      'AQ:AQ': {
        type: 'list',
        values: ['Male', 'Female', 'Other', 'Prefer not to say']
      },
      // Partner ID Proof Type column
      'BI:BI': {
        type: 'list',
        values: ['aadhar_card', 'pan_card', 'passport', 'voter_id', 'driving_license']
      },
      // Partner Address Proof Type column
      'BK:BK': {
        type: 'list',
        values: ['electricity_bill', 'water_bill', 'rent_agreement', 'bank_statement', 'aadhar_card']
      }
    };

    // Apply all validations
    ws['!dataValidation'] = validations;

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // A: Salutation
      { wch: 25 }, // B: Full Name
      { wch: 30 }, // C: Email
      { wch: 15 }, // D: Phone
      { wch: 12 }, // F: Gender
      { wch: 15 }, // G: Date of Birth
      { wch: 20 }, // H: Occupation Category
      { wch: 30 }, // I: Exact Occupation
      { wch: 25 }, // J: Occupation
      { wch: 25 }, // K: Organization
      { wch: 12 }, // L: Years of Experience
      { wch: 15 }, // M: Monthly Income
      { wch: 15 }, // N: Course Duration
      { wch: 15 }, // O: Student ID
      { wch: 15 }, // P: Employee ID
      { wch: 30 }, // Q: Portfolio URL
      { wch: 20 }, // R: Work Mode
      { wch: 15 }, // S: Shift Timing
      { wch: 30 }, // T: Address
      { wch: 15 }, // U: City
      { wch: 15 }, // V: State
      { wch: 10 }, // W: Pincode
      { wch: 20 }, // X: Emergency Contact Name
      { wch: 15 }, // Y: Emergency Contact Phone
      { wch: 15 }, // Z: Emergency Contact Relation
      { wch: 15 }, // AA: Preferred Sharing
      { wch: 15 }, // AB: Preferred Room Type
      { wch: 18 }, // AC: Preferred Property ID
      { wch: 15 }, // AD: Check-in Date
      { wch: 12 }, // AE: Portal Access
      { wch: 10 }, // AF: Status
      { wch: 18 }, // AG: Lock-in Period (months)
      { wch: 20 }, // AH: Lock-in Penalty Amount
      { wch: 20 }, // AI: Lock-in Penalty Type
      { wch: 18 }, // AJ: Notice Period (days)
      { wch: 20 }, // AK: Notice Penalty Amount
      { wch: 20 }, // AL: Notice Penalty Type
      { wch: 20 }, // AM: Partner Full Name
      { wch: 15 }, // AN: Partner Phone
      { wch: 15 }, // AP: Partner Date of Birth
      { wch: 12 }, // AQ: Partner Gender
      { wch: 30 }, // AR: Partner Email
      { wch: 25 }, // AS: Partner Occupation
      { wch: 25 }, // AT: Partner Organization
      { wch: 15 }, // AU: Partner Relationship
      { wch: 30 }, // AV: Partner Address
      { wch: 15 }, // AW: Partner City
      { wch: 15 }, // AX: Partner State
      { wch: 10 }, // AY: Partner Pincode
      { wch: 12 }, // AZ: Is Couple Booking
      { wch: 30 }, // BA: ID Proof URL
      { wch: 30 }, // BB: Address Proof URL
      { wch: 30 }, // BC: Photo URL
      { wch: 18 }, // BD: Aadhar Number
      { wch: 15 }, // BE: PAN Number
      { wch: 20 }, // BF: ID Proof Type
      { wch: 20 }, // BG: Address Proof Type
      { wch: 30 }, // BH: Partner ID Proof URL
      { wch: 20 }, // BI: Partner ID Proof Type
      { wch: 30 }, // BJ: Partner Address Proof URL
      { wch: 20 }, // BK: Partner Address Proof Type
      { wch: 30 }, // BL: Partner Photo URL
      { wch: 50 }  // BM: Additional Documents
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
  <DialogContent className="sm:max-w-md w-[92vw] p-0 rounded-xl overflow-hidden">
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        <h2 className="text-sm font-semibold">Import Tenants</h2>
      </div>
      <button
        onClick={() => onClose()}
        className="p-1 rounded-full hover:bg-white/20 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div className="p-4 space-y-3">
      {/* Template Download */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <button
          onClick={downloadTemplate}
          className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1.5 w-full justify-center py-1"
        >
          <Download size={14} />
          Download Excel Template
        </button>
        <p className="text-[10px] text-gray-500 text-center mt-1.5">
          Contains required columns for tenant import
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-600">
          Upload File <span className="text-gray-400">(.xlsx, .xls, .csv)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="w-full text-xs border border-gray-200 rounded-lg p-2 file:mr-2 file:py-1 file:px-2 file:text-xs file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {selectedFile && (
          <p className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">
            ✓ {selectedFile.name}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
          {error}
        </div>
      )}
    </div>

    <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={importing}
        size="sm"
        className="h-7 text-xs px-3"
      >
        Cancel
      </Button>
      <Button
        onClick={handleImport}
        disabled={!selectedFile || importing}
        size="sm"
        className="h-7 text-xs px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      >
        {importing ? (
          <>
            <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-3 w-3 mr-1.5" />
            Import
          </>
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>
  );
}