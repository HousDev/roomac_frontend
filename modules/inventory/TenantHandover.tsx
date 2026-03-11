import { useEffect, useState, useMemo } from 'react';
import { Plus, Loader2, X, Trash2, ChevronRight, ChevronLeft, Check, Eye, Share2, ShieldCheck, CreditCard as Edit, Trash, Printer, MessageCircle, FileDown, Filter } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TenantHandover {
  id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  handover_date: string;
  inspector_name: string;
  security_deposit: number;
  rent_amount: number;
  notes?: string;
  status: string;
  handover_items?: HandoverItem[];
}

interface HandoverItem {
  id?: string;
  handover_id?: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  asset_id?: string;
  notes?: string;
}

const CATEGORIES = ['Furniture', 'Electronics', 'Mattress', 'Utensils', 'Other'];
const CONDITIONS = ['New', 'Good', 'Used', 'Damaged'];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

const dateFormatter = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
};

// Static data
const staticHandovers: TenantHandover[] = [
  {
    id: '1',
    tenant_name: 'Rahul Sharma',
    tenant_phone: '9876543210',
    tenant_email: 'rahul.sharma@email.com',
    property_name: 'Sunset Villa',
    room_number: '101',
    bed_number: 'A',
    move_in_date: '2026-01-15',
    handover_date: '2026-01-15',
    inspector_name: 'Sanjay Gupta',
    security_deposit: 25000,
    rent_amount: 12000,
    notes: 'Handover completed successfully. All items in good condition.',
    status: 'Confirmed',
    handover_items: [
      {
        id: '101',
        handover_id: '1',
        item_name: 'King Size Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-001',
        notes: 'Wooden frame with storage'
      },
      {
        id: '102',
        handover_id: '1',
        item_name: 'Mattress',
        category: 'Mattress',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-002',
        notes: 'Memory foam'
      },
      {
        id: '103',
        handover_id: '1',
        item_name: 'Wardrobe',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-003',
        notes: '3-door wardrobe'
      },
      {
        id: '104',
        handover_id: '1',
        item_name: 'Study Table',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-004',
        notes: 'With drawer'
      },
      {
        id: '105',
        handover_id: '1',
        item_name: 'Chair',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-005',
        notes: 'Ergonomic chair'
      }
    ]
  },
  {
    id: '2',
    tenant_name: 'Priya Patel',
    tenant_phone: '8765432109',
    tenant_email: 'priya.patel@email.com',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    bed_number: 'B',
    move_in_date: '2026-02-01',
    handover_date: '2026-02-01',
    inspector_name: 'Anjali Desai',
    security_deposit: 30000,
    rent_amount: 15000,
    notes: 'Handover completed. Tenant requested additional shelf.',
    status: 'Active',
    handover_items: [
      {
        id: '201',
        handover_id: '2',
        item_name: 'Queen Size Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-006',
        notes: 'With storage'
      },
      {
        id: '202',
        handover_id: '2',
        item_name: 'Mattress',
        category: 'Mattress',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-007',
        notes: 'Pocket spring'
      },
      {
        id: '203',
        handover_id: '2',
        item_name: 'Refrigerator',
        category: 'Electronics',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-008',
        notes: 'Single door, 190L'
      },
      {
        id: '204',
        handover_id: '2',
        item_name: 'Microwave',
        category: 'Electronics',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-009',
        notes: '20L, convection'
      }
    ]
  },
  {
    id: '3',
    tenant_name: 'Amit Kumar',
    tenant_phone: '7654321098',
    tenant_email: 'amit.kumar@email.com',
    property_name: 'Garden Heights',
    room_number: '302',
    move_in_date: '2026-02-15',
    handover_date: '2026-02-15',
    inspector_name: 'Vikram Singh',
    security_deposit: 18000,
    rent_amount: 9000,
    notes: 'Handover pending item verification.',
    status: 'Pending',
    handover_items: [
      {
        id: '301',
        handover_id: '3',
        item_name: 'Single Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Used',
        asset_id: 'AST-010',
        notes: 'Standard single bed'
      },
      {
        id: '302',
        handover_id: '3',
        item_name: 'Mattress',
        category: 'Mattress',
        quantity: 1,
        condition_at_movein: 'Used',
        asset_id: 'AST-011',
        notes: 'Foam mattress'
      },
      {
        id: '303',
        handover_id: '3',
        item_name: 'Study Desk',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-012',
        notes: 'With shelves'
      }
    ]
  },
  {
    id: '4',
    tenant_name: 'Neha Singh',
    tenant_phone: '6543210987',
    tenant_email: 'neha.singh@email.com',
    property_name: 'Lakeview Residency',
    room_number: '415',
    bed_number: 'C',
    move_in_date: '2026-01-20',
    handover_date: '2026-01-20',
    inspector_name: 'Rajesh Kumar',
    security_deposit: 35000,
    rent_amount: 18000,
    notes: 'Premium room with all amenities.',
    status: 'Confirmed',
    handover_items: [
      {
        id: '401',
        handover_id: '4',
        item_name: 'King Size Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-013',
        notes: 'Upholstered headboard'
      },
      {
        id: '402',
        handover_id: '4',
        item_name: 'Mattress',
        category: 'Mattress',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-014',
        notes: 'Luxury memory foam'
      },
      {
        id: '403',
        handover_id: '4',
        item_name: 'Washing Machine',
        category: 'Electronics',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-015',
        notes: 'Fully automatic, 6.5kg'
      },
      {
        id: '404',
        handover_id: '4',
        item_name: 'TV',
        category: 'Electronics',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-016',
        notes: '32" LED TV'
      },
      {
        id: '405',
        handover_id: '4',
        item_name: 'Dining Table',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'New',
        asset_id: 'AST-017',
        notes: '4-seater with glass top'
      }
    ]
  },
  {
    id: '5',
    tenant_name: 'Vikram Mehta',
    tenant_phone: '5432109876',
    tenant_email: 'vikram.mehta@email.com',
    property_name: 'Sunset Villa',
    room_number: '203',
    move_in_date: '2026-02-10',
    handover_date: '2026-02-10',
    inspector_name: 'Sanjay Gupta',
    security_deposit: 22000,
    rent_amount: 11000,
    notes: 'Handover completed. Tenant is satisfied.',
    status: 'Completed',
    handover_items: [
      {
        id: '501',
        handover_id: '5',
        item_name: 'Double Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-018',
        notes: 'Wooden frame'
      },
      {
        id: '502',
        handover_id: '5',
        item_name: 'Mattress',
        category: 'Mattress',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: 'AST-019',
        notes: 'Spring mattress'
      },
      {
        id: '503',
        handover_id: '5',
        item_name: 'Desk',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Used',
        asset_id: 'AST-020',
        notes: 'Small writing desk'
      },
      {
        id: '504',
        handover_id: '5',
        item_name: 'Chair',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Used',
        asset_id: 'AST-021',
        notes: 'Basic office chair'
      }
    ]
  }
];

export function TenantHandover() {
  const [handovers, setHandovers] = useState<TenantHandover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHandover, setEditingHandover] = useState<TenantHandover | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<TenantHandover | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [statusUpdateData, setStatusUpdateData] = useState({
    newStatus: '',
    remarks: ''
  });
  const [filters, setFilters] = useState({
    property: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    tenantName: '',
    roomNumber: ''
  });

  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_phone: '',
    tenant_email: '',
    property_name: '',
    room_number: '',
    bed_number: '',
    move_in_date: new Date().toISOString().split('T')[0],
    handover_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    security_deposit: 0,
    rent_amount: 0,
    notes: '',
    status: 'Active'
  });

  const [items, setItems] = useState<HandoverItem[]>([
    {
      item_name: '',
      category: 'Furniture',
      quantity: 1,
      condition_at_movein: 'Good',
      asset_id: '',
      notes: ''
    }
  ]);

  useEffect(() => {
    loadHandovers();
  }, []);

  const filteredHandovers = useMemo(() => {
    return handovers.filter(handover => {
      if (filters.property && !handover.property_name.toLowerCase().includes(filters.property.toLowerCase())) {
        return false;
      }
      if (filters.status && handover.status !== filters.status) {
        return false;
      }
      if (filters.tenantName && !handover.tenant_name.toLowerCase().includes(filters.tenantName.toLowerCase())) {
        return false;
      }
      if (filters.roomNumber && !handover.room_number.toLowerCase().includes(filters.roomNumber.toLowerCase())) {
        return false;
      }
      if (filters.dateFrom && new Date(handover.handover_date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(handover.handover_date) > new Date(filters.dateTo)) {
        return false;
      }
      return true;
    });
  }, [handovers, filters]);

  const clearFilters = () => {
    setFilters({
      property: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      tenantName: '',
      roomNumber: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  const loadHandovers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setHandovers(staticHandovers);
    } catch (err: any) {
      setError(err.message || 'Failed to load tenant handovers');
      console.error('Error loading tenant handovers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    resetForm();
    setEditingHandover(null);
    setCurrentStep(1);
    setShowModal(true);
  };

  const handleEdit = async (handover: TenantHandover) => {
    try {
      setEditingHandover(handover);
      setFormData({
        tenant_name: handover.tenant_name || '',
        tenant_phone: handover.tenant_phone || '',
        tenant_email: handover.tenant_email || '',
        property_name: handover.property_name || '',
        room_number: handover.room_number || '',
        bed_number: handover.bed_number || '',
        move_in_date: handover.move_in_date || new Date().toISOString().split('T')[0],
        handover_date: handover.handover_date || new Date().toISOString().split('T')[0],
        inspector_name: handover.inspector_name || '',
        security_deposit: handover.security_deposit || 0,
        rent_amount: handover.rent_amount || 0,
        notes: handover.notes || '',
        status: handover.status || 'Active'
      });

      // Load handover items
      const handoverItems = handover.handover_items || [];
      if (handoverItems.length > 0) {
        setItems(handoverItems);
      }

      setCurrentStep(1);
      setShowModal(true);
    } catch (err: any) {
      alert('Failed to load handover details: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (handover: TenantHandover) => {
    if (!confirm('Delete this handover record permanently? This will also delete all associated items.')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setHandovers(prev => prev.filter(h => h.id !== handover.id));
    } catch (err: any) {
      alert('Failed to delete handover: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenStatusModal = (handover: TenantHandover) => {
    setSelectedHandover(handover);
    setStatusUpdateData({
      newStatus: handover.status,
      remarks: ''
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedHandover) return;

    if (!statusUpdateData.newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setSaving(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setHandovers(prev => prev.map(h => {
        if (h.id === selectedHandover.id) {
          return {
            ...h,
            status: statusUpdateData.newStatus,
            notes: h.notes
              ? `${h.notes}\n\n[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
              : `[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
          };
        }
        return h;
      }));

      setShowStatusModal(false);
      setSelectedHandover(null);
      setStatusUpdateData({ newStatus: '', remarks: '' });
      alert('Status updated successfully!');
    } catch (err: any) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async (handoversToDelete: TenantHandover[]) => {
    if (!confirm(`Delete ${handoversToDelete.length} handover records permanently?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const idsToDelete = new Set(handoversToDelete.map(h => h.id));
      setHandovers(prev => prev.filter(h => !idsToDelete.has(h.id)));
    } catch (err: any) {
      alert('Failed to delete handovers: ' + (err.message || 'Unknown error'));
    }
  };

  const handleViewHandover = async (handover: TenantHandover) => {
    try {
      const fullHandover = handover;
      setSelectedHandover(fullHandover);
      setShowViewModal(true);
    } catch (err: any) {
      alert('Failed to load handover details: ' + (err.message || 'Unknown error'));
    }
  };

  const handleShareHandover = (handover: TenantHandover) => {
    setSelectedHandover(handover);
    setShowShareModal(true);
  };

  const handleInitiateOTP = (handover: TenantHandover) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setSelectedHandover(handover);
    setOtpCode('');
    setShowOTPModal(true);
    alert(`OTP sent to ${handover.tenant_phone}: ${otp}\n\n(In production, this would be sent via SMS)`);
  };

  const handleVerifyOTP = async () => {
    if (otpCode !== generatedOTP) {
      alert('Invalid OTP. Please try again.');
      return;
    }

    if (!selectedHandover) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setHandovers(prev => prev.map(h => {
        if (h.id === selectedHandover.id) {
          return { ...h, status: 'Confirmed' };
        }
        return h;
      }));

      alert('Handover confirmed successfully via OTP!');
      setShowOTPModal(false);
      setOtpCode('');
      setGeneratedOTP('');
      setSelectedHandover(null);
    } catch (err: any) {
      alert('Failed to update handover status: ' + (err.message || 'Unknown error'));
    }
  };

  const copyShareLink = () => {
    if (!selectedHandover) return;
    const link = `${window.location.origin}/handover/${selectedHandover.id}`;
    navigator.clipboard.writeText(link);
    alert('Handover link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    if (!selectedHandover) return;

    try {
      const phoneNumber = selectedHandover.tenant_phone.replace(/\D/g, '');

      if (!phoneNumber) {
        alert('Phone number is missing or invalid!');
        return;
      }

      const message = encodeURIComponent(
        `🏠 TENANT HANDOVER DOCUMENT\n\n` +
        `Tenant: ${selectedHandover.tenant_name}\n` +
        `Property: ${selectedHandover.property_name}\n` +
        `Room: ${selectedHandover.room_number}\n` +
        `Move-in Date: ${dateFormatter(selectedHandover.move_in_date)}\n` +
        `Security Deposit: ${currencyFormatter.format(selectedHandover.security_deposit)}\n\n` +
        `Items Handed Over: ${selectedHandover.handover_items?.length || 0} items\n\n` +
        `View full details: ${window.location.origin}/handover/${selectedHandover.id}`
      );

      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      const opened = window.open(whatsappUrl, '_blank');

      if (!opened) {
        alert('Please allow pop-ups to share via WhatsApp');
      }
    } catch (err: any) {
      console.error('WhatsApp share error:', err);
      alert('Failed to share via WhatsApp: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedHandover) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TENANT HANDOVER DOCUMENT', pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Document ID: ${selectedHandover.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });

      yPos += 10;
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenant Information', margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const tenantInfo = [
        ['Tenant Name:', selectedHandover.tenant_name],
        ['Phone:', selectedHandover.tenant_phone],
        ['Email:', selectedHandover.tenant_email || 'N/A'],
        ['Property:', selectedHandover.property_name],
        ['Room Number:', selectedHandover.room_number],
        ['Bed Number:', selectedHandover.bed_number || 'N/A'],
      ];

      tenantInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, yPos);
        yPos += 6;
      });

      yPos += 4;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Handover Details', margin, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const handoverInfo = [
        ['Move-in Date:', dateFormatter(selectedHandover.move_in_date)],
        ['Handover Date:', dateFormatter(selectedHandover.handover_date)],
        ['Inspector:', selectedHandover.inspector_name],
        ['Security Deposit:', currencyFormatter.format(selectedHandover.security_deposit)],
        ['Rent Amount:', currencyFormatter.format(selectedHandover.rent_amount)],
        ['Status:', selectedHandover.status],
      ];

      handoverInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, yPos);
        yPos += 6;
      });

      if (selectedHandover.handover_items && selectedHandover.handover_items.length > 0) {
        yPos += 4;

        if (yPos > pageHeight - 60) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Item Checklist (${selectedHandover.handover_items.length} Items)`, margin, yPos);
        yPos += 8;

        const tableData = selectedHandover.handover_items.map((item, idx) => [
          (idx + 1).toString(),
          item.item_name,
          item.category,
          item.quantity.toString(),
          item.condition_at_movein,
          item.notes || '-'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Item Name', 'Category', 'Qty', 'Condition', 'Notes']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center'
          },
          bodyStyles: {
            fontSize: 9,
            cellPadding: 3
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { cellWidth: 40 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 15 },
            4: { halign: 'center', cellWidth: 25 },
            5: { cellWidth: 'auto' }
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          },
          margin: { left: margin, right: margin },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      if (selectedHandover.notes) {
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = margin;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Notes:', margin, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(selectedHandover.notes, contentWidth);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 5 + 10;
      }

      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = margin;
      }

      yPos += 10;
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Signatures', margin, yPos);
      yPos += 10;

      const signatureWidth = (contentWidth - 20) / 3;
      const signatureY = yPos;

      const signatures = [
        { name: selectedHandover.tenant_name, label: 'Tenant Signature', date: dateFormatter(selectedHandover.handover_date) },
        { name: selectedHandover.inspector_name, label: 'Inspector/Manager', date: dateFormatter(selectedHandover.handover_date) },
        { name: 'Witness', label: 'Witness Signature', date: '__________' }
      ];

      signatures.forEach((sig, idx) => {
        const xPos = margin + idx * (signatureWidth + 10);

        doc.setLineWidth(0.3);
        doc.line(xPos, signatureY + 15, xPos + signatureWidth, signatureY + 15);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(sig.name, xPos + signatureWidth / 2, signatureY + 20, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(sig.label, xPos + signatureWidth / 2, signatureY + 25, { align: 'center' });
        doc.text(`Date: ${sig.date}`, xPos + signatureWidth / 2, signatureY + 30, { align: 'center' });
      });

      yPos = signatureY + 40;

      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFillColor(239, 246, 255);
      doc.rect(margin, yPos, contentWidth, 20, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const disclaimer = 'This is an official handover document. By signing, both parties acknowledge the accuracy of the information above.';
      const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
      doc.text(disclaimerLines, pageWidth / 2, yPos + 6, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.text(`Status: ${selectedHandover.status}`, pageWidth / 2, yPos + 15, { align: 'center' });

      const totalPages = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`,
          pageWidth - margin,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      const fileName = `Handover_${selectedHandover.tenant_name.replace(/\s+/g, '_')}_${selectedHandover.property_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      console.log('PDF generated successfully:', fileName);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    }
  };

  const validateStep1 = () => {
    if (!formData.tenant_name.trim()) {
      alert('Please enter tenant name');
      return false;
    }
    if (!formData.tenant_phone.trim()) {
      alert('Please enter tenant phone');
      return false;
    }
    if (!formData.property_name.trim()) {
      alert('Please enter property name');
      return false;
    }
    if (!formData.room_number.trim()) {
      alert('Please enter room number');
      return false;
    }
    if (!formData.move_in_date) {
      alert('Please select move-in date');
      return false;
    }
    if (!formData.handover_date) {
      alert('Please select handover date');
      return false;
    }
    if (!formData.inspector_name.trim()) {
      alert('Please enter inspector name');
      return false;
    }
    if (formData.security_deposit < 0) {
      alert('Security deposit cannot be negative');
      return false;
    }
    if (formData.rent_amount < 0) {
      alert('Rent amount cannot be negative');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return false;
    }
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.item_name.trim()) {
        alert(`Please enter name for item ${i + 1}`);
        return false;
      }
      if (item.quantity <= 0) {
        alert(`Quantity for item ${i + 1} must be greater than 0`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    try {
      setSaving(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      if (editingHandover) {
        // Update existing handover
        const updatedHandover: TenantHandover = {
          ...editingHandover,
          ...formData,
          handover_items: items
        };
        setHandovers(prev => prev.map(h => h.id === editingHandover.id ? updatedHandover : h));
      } else {
        // Create new handover
        const newHandover: TenantHandover = {
          id: `${Date.now()}`,
          ...formData,
          handover_items: items
        };
        setHandovers(prev => [newHandover, ...prev]);
      }

      setShowModal(false);
      setEditingHandover(null);
      resetForm();
      alert(`Handover ${editingHandover ? 'updated' : 'created'} successfully with ${items.length} items!`);
    } catch (err: any) {
      alert('Failed to save handover: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_name: '',
      tenant_phone: '',
      tenant_email: '',
      property_name: '',
      room_number: '',
      bed_number: '',
      move_in_date: new Date().toISOString().split('T')[0],
      handover_date: new Date().toISOString().split('T')[0],
      inspector_name: '',
      security_deposit: 0,
      rent_amount: 0,
      notes: '',
      status: 'Active'
    });
    setItems([
      {
        item_name: '',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: '',
        notes: ''
      }
    ]);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        item_name: '',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        asset_id: '',
        notes: ''
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert('At least one item is required');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof HandoverItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'Active':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Completed':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const renderActions = (handover: TenantHandover) => (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => handleViewHandover(handover)}
        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors shadow-sm hover:shadow"
        title="View Handover Details"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
      <button
        onClick={() => handleEdit(handover)}
        className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors shadow-sm hover:shadow"
        title="Edit Handover"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={() => handleDelete(handover)}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors shadow-sm hover:shadow"
        title="Delete Handover"
      >
        <Trash className="w-4 h-4" />
        Delete
      </button>
    </div>
  );

  const columns = [
    {
      key: 'tenant_name',
      label: 'Tenant Name',
      sortable: true,
      searchable: true
    },
    {
      key: 'tenant_phone',
      label: 'Phone',
      sortable: true,
      searchable: true
    },
    {
      key: 'property_name',
      label: 'Property',
      sortable: true,
      searchable: true
    },
    {
      key: 'room_number',
      label: 'Room',
      sortable: true,
      searchable: true
    },
    {
      key: 'bed_number',
      label: 'Bed',
      sortable: true,
      searchable: true,
      render: (row: TenantHandover) => row.bed_number || 'N/A'
    },
    {
      key: 'move_in_date',
      label: 'Move-In Date',
      sortable: true,
      render: (row: TenantHandover) => dateFormatter(row.move_in_date)
    },
    {
      key: 'handover_date',
      label: 'Handover Date',
      sortable: true,
      render: (row: TenantHandover) => dateFormatter(row.handover_date)
    },
    {
      key: 'security_deposit',
      label: 'Security Deposit',
      sortable: true,
      render: (row: TenantHandover) => (
        <span className="font-bold text-green-700">{currencyFormatter.format(row.security_deposit || 0)}</span>
      )
    },
    {
      key: 'handover_items',
      label: 'Items Count',
      sortable: false,
      render: (row: TenantHandover) => (
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold border border-blue-300">
            {row.handover_items?.length || 0} items
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: TenantHandover) => (
        <button
          onClick={() => handleOpenStatusModal(row)}
          className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all ${getStatusBadgeClass(row.status)}`}
          title="Click to update status"
        >
          {row.status}
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      searchable: false,
      render: (row: TenantHandover) => renderActions(row)
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
          <button
            onClick={loadHandovers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full print:hidden">
      <div className="mb-6 print:hidden bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Tenant Handover
              </h1>
              <p className="text-gray-600 font-semibold mt-1">Manage move-in handovers with item checklist</p>
            </div>
          </div>
          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
          >
            <Filter className="w-5 h-5" />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-white text-blue-600 rounded-full text-xs font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="print:hidden">
        {activeFiltersCount > 0 && (
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </span>
            </div>
            {filters.tenantName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Tenant:</span>
                <span className="text-sm font-bold text-gray-900">{filters.tenantName}</span>
              </div>
            )}
            {filters.property && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Property:</span>
                <span className="text-sm font-bold text-gray-900">{filters.property}</span>
              </div>
            )}
            {filters.roomNumber && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Room:</span>
                <span className="text-sm font-bold text-gray-900">{filters.roomNumber}</span>
              </div>
            )}
            {filters.status && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${getStatusBadgeClass(filters.status)}`}>
                  {filters.status}
                </span>
              </div>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-bold text-gray-900">
                  {filters.dateFrom ? dateFormatter(filters.dateFrom) : 'Any'} → {filters.dateTo ? dateFormatter(filters.dateTo) : 'Any'}
                </span>
              </div>
            )}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}
        <DataTable
          data={filteredHandovers}
          columns={columns}
          onAdd={handleAdd}
          onExport={() => { }}
          title="Tenant Handovers"
          addButtonText="Add Handover"
          rowKey="id"
          enableBulkActions={true}
          onBulkDelete={handleBulkDelete}
          hideFilters={true}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto print:hidden">
          <div className="bg-white rounded-xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto print:hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingHandover ? 'Edit Handover' : 'New Handover'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Step {currentStep} of 2 - {currentStep === 1 ? 'Tenant & Property Details' : 'Items Checklist'}
                  </p>
                </div>
                <button
                  onClick={() => { setShowModal(false); setEditingHandover(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                  {currentStep === 1 ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <span className="text-sm font-bold">Details</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  <div className={`w-5 h-5 rounded-full ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'
                    } flex items-center justify-center text-xs font-bold`}>2</div>
                  <span className="text-sm font-bold">Items</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tenant Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.tenant_name}
                        onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Tenant Phone <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.tenant_phone}
                        onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Email</label>
                    <input
                      type="email"
                      value={formData.tenant_email}
                      onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Property Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.property_name}
                        onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Room Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.room_number}
                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Bed Number</label>
                      <input
                        type="text"
                        value={formData.bed_number}
                        onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Move-in Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.move_in_date}
                        onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Handover Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.handover_date}
                        onChange={(e) => setFormData({ ...formData, handover_date: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Inspector Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.inspector_name}
                      onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Security Deposit <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.security_deposit}
                        onChange={(e) => setFormData({ ...formData, security_deposit: Number(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Rent Amount <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.rent_amount}
                        onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 font-semibold">
                      Add all items being handed over to the tenant. You must add at least one item.
                    </p>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 relative">
                      <div className="absolute top-2 right-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="font-bold text-gray-700 mb-3">Item {index + 1}</div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Item Name <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={item.item_name}
                            onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Category <span className="text-red-600">*</span>
                          </label>
                          <select
                            required
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Quantity <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">
                            Condition at Move-in <span className="text-red-600">*</span>
                          </label>
                          <select
                            required
                            value={item.condition_at_movein}
                            onChange={(e) => updateItem(index, 'condition_at_movein', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          >
                            {CONDITIONS.map(cond => (
                              <option key={cond} value={cond}>{cond}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Asset ID</label>
                          <input
                            type="text"
                            value={item.asset_id || ''}
                            onChange={(e) => updateItem(index, 'asset_id', e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Item
                  </button>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}
                {currentStep === 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingHandover ? 'Update' : 'Create'} Handover
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedHandover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)} data-print-modal>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Tenant Handover Document</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Document ID: <span className="font-mono font-bold text-blue-600">{selectedHandover.id.substring(0, 8).toUpperCase()}</span>
                  </p>
                </div>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg no-print">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  Share on WhatsApp
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  Print Page
                </button>
                {selectedHandover.status !== 'Confirmed' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleInitiateOTP(selectedHandover);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify with OTP
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Tenant Name</div>
                  <div className="font-bold text-gray-900">{selectedHandover.tenant_name}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="font-bold text-gray-900">{selectedHandover.tenant_phone}</div>
                </div>
                {selectedHandover.tenant_email && (
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-bold text-gray-900">{selectedHandover.tenant_email}</div>
                  </div>
                )}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Property</div>
                  <div className="font-bold text-gray-900">{selectedHandover.property_name}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Room / Bed</div>
                  <div className="font-bold text-gray-900">
                    {selectedHandover.room_number} {selectedHandover.bed_number ? `/ ${selectedHandover.bed_number}` : ''}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Move-in Date</div>
                  <div className="font-bold text-gray-900">{dateFormatter(selectedHandover.move_in_date)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Handover Date</div>
                  <div className="font-bold text-gray-900">{dateFormatter(selectedHandover.handover_date)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Inspector Name</div>
                  <div className="font-bold text-gray-900">{selectedHandover.inspector_name}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass(selectedHandover.status)}`}>
                    {selectedHandover.status}
                  </span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Security Deposit</div>
                  <div className="font-bold text-gray-900">{currencyFormatter.format(selectedHandover.security_deposit)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Rent Amount</div>
                  <div className="font-bold text-gray-900">{currencyFormatter.format(selectedHandover.rent_amount)}</div>
                </div>
              </div>

              {selectedHandover.handover_items && selectedHandover.handover_items.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center justify-between">
                    <span>Item Checklist</span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {selectedHandover.handover_items.length} Items
                    </span>
                  </h3>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">#</th>
                          <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Item Name</th>
                          <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Category</th>
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Quantity</th>
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Condition</th>
                          <th className="px-4 py-3 text-left text-sm font-bold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedHandover.handover_items.map((item, idx) => (
                          <tr key={idx} className={`border-b-2 border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                            <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200">
                              {item.item_name}
                            </td>
                            <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-200">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-center border-r border-gray-200">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.condition_at_movein === 'New' ? 'bg-green-100 text-green-800' :
                                item.condition_at_movein === 'Good' ? 'bg-blue-100 text-blue-800' :
                                  item.condition_at_movein === 'Used' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-orange-100 text-orange-800'
                                }`}>
                                {item.condition_at_movein}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedHandover.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <h3 className="text-sm font-black text-amber-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-amber-800">{selectedHandover.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                    <div className="font-bold text-gray-900">{selectedHandover.tenant_name}</div>
                    <div className="text-sm text-gray-600">Tenant Signature</div>
                    <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(selectedHandover.handover_date)}</div>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                    <div className="font-bold text-gray-900">{selectedHandover.inspector_name}</div>
                    <div className="text-sm text-gray-600">Inspector/Manager Signature</div>
                    <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(selectedHandover.handover_date)}</div>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                    <div className="font-bold text-gray-900">Witness</div>
                    <div className="text-sm text-gray-600">Witness Signature</div>
                    <div className="text-xs text-gray-500 mt-1">Date: __________</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                <div className="text-xs text-blue-900 font-semibold">
                  This is an official handover document. By signing, both parties acknowledge the accuracy of the information above.
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  Status: <span className={`font-bold ${selectedHandover.status === 'Confirmed' ? 'text-green-700' : 'text-amber-700'}`}>
                    {selectedHandover.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && selectedHandover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Share Handover</h2>
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tenant Name</label>
                <div className="text-gray-900">{selectedHandover.tenant_name}</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/handover/${selectedHandover.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Share this link with the tenant to view their handover details and item checklist.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOTPModal && selectedHandover && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowOTPModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Verify OTP</h2>
              <button onClick={() => setShowOTPModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-bold text-blue-900 text-sm">OTP Sent</div>
                    <div className="text-sm text-blue-700 mt-1">
                      A 6-digit OTP has been sent to {selectedHandover.tenant_phone}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tenant Name</label>
                <div className="text-gray-900">{selectedHandover.tenant_name}</div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest"
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otpCode.length !== 6}
                className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Verify & Confirm Handover
              </button>

              <div className="text-center">
                <button
                  onClick={() => handleInitiateOTP(selectedHandover)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-bold"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedHandover && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Update Status</h2>
                  <p className="text-sm text-emerald-100 mt-1">Approve and change handover status</p>
                </div>
                <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Tenant:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.tenant_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Property:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.property_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.room_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <p className="mt-0.5">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedHandover.status)}`}>
                        {selectedHandover.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Status <span className="text-red-600">*</span>
                </label>
                <select
                  value={statusUpdateData.newStatus}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, newStatus: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks / Notes
                </label>
                <textarea
                  value={statusUpdateData.remarks}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, remarks: e.target.value })}
                  placeholder="Add any remarks or notes about this status update..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  This will be added to the handover notes with timestamp.
                </p>
              </div>

              {statusUpdateData.newStatus !== selectedHandover.status && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 text-sm">Status Change</div>
                      <div className="text-sm text-amber-800 mt-1">
                        Status will change from <span className="font-bold">{selectedHandover.status}</span> to{' '}
                        <span className="font-bold">{statusUpdateData.newStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving || !statusUpdateData.newStatus}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowFilterModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Advanced Filters</h2>
                  <p className="text-sm text-blue-100 mt-1">Refine your handover search</p>
                </div>
                <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Basic Filters</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      value={filters.tenantName}
                      onChange={(e) => setFilters({ ...filters, tenantName: e.target.value })}
                      placeholder="Search by tenant name..."
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Property Name
                    </label>
                    <input
                      type="text"
                      value={filters.property}
                      onChange={(e) => setFilters({ ...filters, property: e.target.value })}
                      placeholder="Search by property..."
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={filters.roomNumber}
                      onChange={(e) => setFilters({ ...filters, roomNumber: e.target.value })}
                      placeholder="Search by room..."
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Date Range Filter</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
                    />
                  </div>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-bold text-blue-900">
                        {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
                      </span>
                    </div>
                    <button
                      onClick={clearFilters}
                      className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}