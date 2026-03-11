import { useEffect, useState } from 'react';
import { Plus, Loader2, X, ChevronRight, ChevronLeft, Check, AlertCircle, Eye, ShieldCheck, Printer, MessageCircle } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MoveOutInspection {
  id: string;
  handover_id: string;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  inspection_date: string;
  inspector_name: string;
  total_penalty: number;
  notes?: string;
  status: string;
  inspection_items?: InspectionItem[];
}

interface InspectionItem {
  id?: string;
  inspection_id?: string;
  handover_item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  condition_at_moveout: string;
  penalty_amount: number;
  notes?: string;
}

interface TenantHandover {
  id: string;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  status: string;
}

interface HandoverItem {
  id: string;
  handover_id: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  notes?: string;
}

interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
}

const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

const dateFormatter = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
};

// Static data
const staticPenaltyRules: PenaltyRule[] = [
  { id: '1', item_category: 'Furniture', from_condition: 'New', to_condition: 'Used', penalty_amount: 2000 },
  { id: '2', item_category: 'Furniture', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 5000 },
  { id: '3', item_category: 'Furniture', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 3000 },
  { id: '4', item_category: 'Furniture', from_condition: 'New', to_condition: 'Missing', penalty_amount: 10000 },
  { id: '5', item_category: 'Appliances', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 4000 },
  { id: '6', item_category: 'Appliances', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 2500 },
  { id: '7', item_category: 'Appliances', from_condition: 'New', to_condition: 'Missing', penalty_amount: 8000 },
  { id: '8', item_category: 'Bedding', from_condition: 'New', to_condition: 'Used', penalty_amount: 500 },
  { id: '9', item_category: 'Bedding', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 800 },
  { id: '10', item_category: 'Bedding', from_condition: 'New', to_condition: 'Missing', penalty_amount: 2000 },
];

const staticHandovers: TenantHandover[] = [
  {
    id: '1',
    tenant_name: 'Rahul Sharma',
    tenant_phone: '9876543210',
    property_name: 'Sunset Villa',
    room_number: '101',
    bed_number: 'A',
    move_in_date: '2026-01-15',
    status: 'Active'
  },
  {
    id: '2',
    tenant_name: 'Priya Patel',
    tenant_phone: '8765432109',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    bed_number: 'B',
    move_in_date: '2026-02-01',
    status: 'Active'
  },
  {
    id: '3',
    tenant_name: 'Amit Kumar',
    tenant_phone: '7654321098',
    property_name: 'Garden Heights',
    room_number: '302',
    move_in_date: '2026-02-15',
    status: 'Pending'
  },
  {
    id: '4',
    tenant_name: 'Neha Singh',
    tenant_phone: '6543210987',
    property_name: 'Lakeview Residency',
    room_number: '415',
    bed_number: 'C',
    move_in_date: '2026-01-20',
    status: 'Active'
  },
  {
    id: '5',
    tenant_name: 'Vikram Mehta',
    tenant_phone: '5432109876',
    property_name: 'Sunset Villa',
    room_number: '203',
    move_in_date: '2026-02-10',
    status: 'Active'
  }
];

const staticHandoverItems: Record<string, HandoverItem[]> = {
  '1': [
    { id: '101', handover_id: '1', item_name: 'King Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '102', handover_id: '1', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '103', handover_id: '1', item_name: 'Wardrobe', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '104', handover_id: '1', item_name: 'Study Table', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '105', handover_id: '1', item_name: 'Chair', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
  ],
  '2': [
    { id: '201', handover_id: '2', item_name: 'Queen Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '202', handover_id: '2', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '203', handover_id: '2', item_name: 'Refrigerator', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '204', handover_id: '2', item_name: 'Microwave', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
  ],
  '3': [
    { id: '301', handover_id: '3', item_name: 'Single Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Used', notes: '' },
    { id: '302', handover_id: '3', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Used', notes: '' },
    { id: '303', handover_id: '3', item_name: 'Study Desk', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
  ],
  '4': [
    { id: '401', handover_id: '4', item_name: 'King Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '402', handover_id: '4', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '403', handover_id: '4', item_name: 'Washing Machine', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
    { id: '404', handover_id: '4', item_name: 'TV', category: 'Electronics', quantity: 1, condition_at_movein: 'Good', notes: '' },
  ],
  '5': [
    { id: '501', handover_id: '5', item_name: 'Double Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '502', handover_id: '5', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Good', notes: '' },
    { id: '503', handover_id: '5', item_name: 'Desk', category: 'Furniture', quantity: 1, condition_at_movein: 'Used', notes: '' },
  ]
};

const staticInspections: MoveOutInspection[] = [
  {
    id: '1001',
    handover_id: '1',
    tenant_name: 'Rahul Sharma',
    tenant_phone: '9876543210',
    property_name: 'Sunset Villa',
    room_number: '101',
    bed_number: 'A',
    inspection_date: '2026-03-15',
    inspector_name: 'Sanjay Gupta',
    total_penalty: 3500,
    notes: 'Minor damages to furniture',
    status: 'Completed',
    inspection_items: [
      {
        id: '10001',
        inspection_id: '1001',
        handover_item_id: '101',
        item_name: 'King Size Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'New',
        condition_at_moveout: 'Good',
        penalty_amount: 2000,
        notes: 'Small scratch on headboard'
      },
      {
        id: '10002',
        inspection_id: '1001',
        handover_item_id: '102',
        item_name: 'Mattress',
        category: 'Bedding',
        quantity: 1,
        condition_at_movein: 'New',
        condition_at_moveout: 'Used',
        penalty_amount: 500,
        notes: 'Normal wear'
      },
      {
        id: '10003',
        inspection_id: '1001',
        handover_item_id: '103',
        item_name: 'Wardrobe',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Good',
        penalty_amount: 0,
        notes: 'Good condition'
      },
      {
        id: '10004',
        inspection_id: '1001',
        handover_item_id: '104',
        item_name: 'Study Table',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Damaged',
        penalty_amount: 1000,
        notes: 'Broken leg'
      }
    ]
  },
  {
    id: '1002',
    handover_id: '2',
    tenant_name: 'Priya Patel',
    tenant_phone: '8765432109',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    bed_number: 'B',
    inspection_date: '2026-03-10',
    inspector_name: 'Anjali Desai',
    total_penalty: 0,
    notes: 'All items in good condition',
    status: 'Approved',
    inspection_items: [
      {
        id: '20001',
        inspection_id: '1002',
        handover_item_id: '201',
        item_name: 'Queen Size Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Good',
        penalty_amount: 0,
        notes: ''
      },
      {
        id: '20002',
        inspection_id: '1002',
        handover_item_id: '202',
        item_name: 'Mattress',
        category: 'Bedding',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Good',
        penalty_amount: 0,
        notes: ''
      },
      {
        id: '20003',
        inspection_id: '1002',
        handover_item_id: '203',
        item_name: 'Refrigerator',
        category: 'Appliances',
        quantity: 1,
        condition_at_movein: 'New',
        condition_at_moveout: 'Good',
        penalty_amount: 0,
        notes: 'Working properly'
      }
    ]
  },
  {
    id: '1003',
    handover_id: '3',
    tenant_name: 'Amit Kumar',
    tenant_phone: '7654321098',
    property_name: 'Garden Heights',
    room_number: '302',
    inspection_date: '2026-03-05',
    inspector_name: 'Vikram Singh',
    total_penalty: 5500,
    notes: 'Damages and missing items',
    status: 'Pending',
    inspection_items: [
      {
        id: '30001',
        inspection_id: '1003',
        handover_item_id: '301',
        item_name: 'Single Bed',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Used',
        condition_at_moveout: 'Damaged',
        penalty_amount: 2500,
        notes: 'Broken slats'
      },
      {
        id: '30002',
        inspection_id: '1003',
        handover_item_id: '302',
        item_name: 'Mattress',
        category: 'Bedding',
        quantity: 1,
        condition_at_movein: 'Used',
        condition_at_moveout: 'Damaged',
        penalty_amount: 800,
        notes: 'Stains and tears'
      },
      {
        id: '30003',
        inspection_id: '1003',
        handover_item_id: '303',
        item_name: 'Study Desk',
        category: 'Furniture',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Missing',
        penalty_amount: 2200,
        notes: 'Item not found'
      }
    ]
  },
  {
    id: '1004',
    handover_id: '4',
    tenant_name: 'Neha Singh',
    tenant_phone: '6543210987',
    property_name: 'Lakeview Residency',
    room_number: '415',
    bed_number: 'C',
    inspection_date: '2026-03-12',
    inspector_name: 'Rajesh Kumar',
    total_penalty: 8000,
    notes: 'Major appliance damage',
    status: 'Active',
    inspection_items: [
      {
        id: '40001',
        inspection_id: '1004',
        handover_item_id: '403',
        item_name: 'Washing Machine',
        category: 'Appliances',
        quantity: 1,
        condition_at_movein: 'New',
        condition_at_moveout: 'Damaged',
        penalty_amount: 8000,
        notes: 'Not working, water damage'
      }
    ]
  },
  {
    id: '1005',
    handover_id: '5',
    tenant_name: 'Vikram Mehta',
    tenant_phone: '5432109876',
    property_name: 'Sunset Villa',
    room_number: '203',
    inspection_date: '2026-03-08',
    inspector_name: 'Sanjay Gupta',
    total_penalty: 500,
    notes: 'Minor issues',
    status: 'Completed',
    inspection_items: [
      {
        id: '50001',
        inspection_id: '1005',
        handover_item_id: '502',
        item_name: 'Mattress',
        category: 'Bedding',
        quantity: 1,
        condition_at_movein: 'Good',
        condition_at_moveout: 'Damaged',
        penalty_amount: 500,
        notes: 'Small tear'
      }
    ]
  }
];

export function MoveOutInspection() {
  const [inspections, setInspections] = useState<MoveOutInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loadingHandovers, setLoadingHandovers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [editingInspection, setEditingInspection] = useState<MoveOutInspection | null>(null);

  const [activeHandovers, setActiveHandovers] = useState<TenantHandover[]>([]);
  const [selectedHandover, setSelectedHandover] = useState<TenantHandover | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [viewInspection, setViewInspection] = useState<MoveOutInspection | null>(null);
  const [selectedInspectionForStatus, setSelectedInspectionForStatus] = useState<MoveOutInspection | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [statusUpdateData, setStatusUpdateData] = useState({
    newStatus: '',
    remarks: ''
  });

  const [formData, setFormData] = useState({
    handover_id: '',
    inspector_name: '',
    inspection_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setInspections(staticInspections);
    } catch (err: any) {
      setError(err.message || 'Failed to load move-out inspections');
      console.error('Error loading move-out inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveHandovers = async () => {
    try {
      setLoadingHandovers(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // Filter for Active or Pending handovers
      const active = staticHandovers.filter(h => h.status === 'Active' || h.status === 'Pending');
      setActiveHandovers(active);
    } catch (err: any) {
      alert('Failed to load handovers: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingHandovers(false);
    }
  };

  const handleAdd = async () => {
    resetForm();
    setCurrentStep(1);
    setShowModal(true);
    await loadActiveHandovers();
  };

  const handleSelectHandover = async (handoverId: string) => {
    if (!handoverId) {
      setSelectedHandover(null);
      setInspectionItems([]);
      return;
    }

    try {
      setLoadingItems(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Get handover details
      const handover = staticHandovers.find(h => h.id === handoverId) || null;
      setSelectedHandover(handover);

      // Get handover items
      const items = staticHandoverItems[handoverId] || [];

      // Initialize inspection items with zero penalty
      const initialInspectionItems: InspectionItem[] = items.map(item => ({
        handover_item_id: item.id,
        item_name: item.item_name,
        category: item.category,
        quantity: item.quantity,
        condition_at_movein: item.condition_at_movein,
        condition_at_moveout: item.condition_at_movein, // Default to same condition
        penalty_amount: 0,
        notes: ''
      }));

      setInspectionItems(initialInspectionItems);
    } catch (err: any) {
      alert('Failed to load handover items: ' + (err.message || 'Unknown error'));
    } finally {
      setLoadingItems(false);
    }
  };

  const calculatePenalty = async (
    category: string,
    fromCondition: string,
    toCondition: string
  ): Promise<number> => {
    try {
      // If condition didn't change, no penalty
      if (fromCondition === toCondition) {
        return 0;
      }

      // If item is missing, get the highest penalty for that category
      if (toCondition === 'Missing') {
        const categoryRules = staticPenaltyRules.filter(r => r.item_category === category);
        if (categoryRules.length === 0) return 1000; // Default penalty if no rules
        return Math.max(...categoryRules.map(r => r.penalty_amount || 0));
      }

      // Otherwise, look up the penalty rule
      const rule = staticPenaltyRules.find(r =>
        r.item_category === category &&
        r.from_condition === fromCondition &&
        r.to_condition === toCondition
      );
      return rule?.penalty_amount || 0;
    } catch (err) {
      console.error('Error calculating penalty:', err);
      return 0;
    }
  };

  const updateInspectionItem = async (
    index: number,
    field: keyof InspectionItem,
    value: any
  ) => {
    const newItems = [...inspectionItems];
    newItems[index] = { ...newItems[index], [field]: value };

    // If condition changed, recalculate penalty
    if (field === 'condition_at_moveout') {
      const item = newItems[index];
      const penalty = await calculatePenalty(
        item.category,
        item.condition_at_movein,
        value
      );
      newItems[index].penalty_amount = penalty;
    }

    setInspectionItems(newItems);
  };

  const getTotalPenalty = () => {
    return inspectionItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
  };

  const validateStep1 = () => {
    if (!formData.handover_id) {
      alert('Please select a tenant handover');
      return false;
    }
    if (!formData.inspector_name.trim()) {
      alert('Please enter inspector name');
      return false;
    }
    if (!formData.inspection_date) {
      alert('Please select inspection date');
      return false;
    }
    if (inspectionItems.length === 0) {
      alert('Selected handover has no items to inspect');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    for (let i = 0; i < inspectionItems.length; i++) {
      const item = inspectionItems[i];
      if (!item.condition_at_moveout) {
        alert(`Please select move-out condition for item ${i + 1}: ${item.item_name}`);
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

      const totalPenalty = getTotalPenalty();

      if (editingInspection) {
        // Update existing inspection
        const updatedInspection: MoveOutInspection = {
          ...editingInspection,
          inspection_date: formData.inspection_date,
          inspector_name: formData.inspector_name,
          total_penalty: totalPenalty,
          notes: formData.notes,
          inspection_items: inspectionItems.map((item, index) => ({
            ...item,
            id: editingInspection.inspection_items?.[index]?.id || `${Date.now()}-${index}`,
            inspection_id: editingInspection.id
          }))
        };

        setInspections(prev => prev.map(i => i.id === editingInspection.id ? updatedInspection : i));

        alert(`Inspection updated successfully!\n\nTotal Penalty: ${currencyFormatter.format(totalPenalty)}`);
      } else {
        // Create new inspection record
        const newInspection: MoveOutInspection = {
          id: `${Date.now()}`,
          handover_id: formData.handover_id,
          tenant_name: selectedHandover?.tenant_name || '',
          tenant_phone: selectedHandover?.tenant_phone || '',
          property_name: selectedHandover?.property_name || '',
          room_number: selectedHandover?.room_number || '',
          bed_number: selectedHandover?.bed_number || '',
          inspection_date: formData.inspection_date,
          inspector_name: formData.inspector_name,
          total_penalty: totalPenalty,
          notes: formData.notes,
          status: 'Completed',
          inspection_items: inspectionItems.map((item, index) => ({
            ...item,
            id: `${Date.now()}-${index}`,
            inspection_id: `${Date.now()}`
          }))
        };

        setInspections(prev => [newInspection, ...prev]);

        alert(
          `Inspection completed successfully!\n\n` +
          `Total Penalty: ${currencyFormatter.format(totalPenalty)}\n` +
          `Items Inspected: ${inspectionItems.length}`
        );
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert('Failed to save inspection: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (inspection: MoveOutInspection) => {
    try {
      setEditingInspection(inspection);
      setCurrentStep(2); // Skip to step 2 since handover is already selected

      // Find full inspection with items
      const fullInspection = staticInspections.find(i => i.id === inspection.id) || inspection;

      setFormData({
        handover_id: inspection.handover_id,
        inspector_name: inspection.inspector_name,
        inspection_date: inspection.inspection_date,
        notes: inspection.notes || ''
      });

      // Set selected handover info
      setSelectedHandover({
        id: inspection.handover_id,
        tenant_name: inspection.tenant_name,
        tenant_phone: inspection.tenant_phone,
        property_name: inspection.property_name,
        room_number: inspection.room_number,
        bed_number: inspection.bed_number || '',
        move_in_date: '',
        status: 'Active'
      });

      // Load inspection items
      if (fullInspection.inspection_items && fullInspection.inspection_items.length > 0) {
        setInspectionItems(fullInspection.inspection_items);
      } else {
        setInspectionItems([]);
      }

      setShowModal(true);
    } catch (err: any) {
      alert('Failed to load inspection for editing: ' + (err.message || 'Unknown error'));
    }
  };

  const handleDelete = async (inspection: MoveOutInspection) => {
    if (!confirm('Delete this inspection record permanently? This will also delete all associated items.')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setInspections(prev => prev.filter(i => i.id !== inspection.id));
    } catch (err: any) {
      alert('Failed to delete inspection: ' + (err.message || 'Unknown error'));
    }
  };

  const handleOpenStatusModal = (inspection: MoveOutInspection) => {
    setSelectedInspectionForStatus(inspection);
    setStatusUpdateData({
      newStatus: inspection.status,
      remarks: ''
    });
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedInspectionForStatus) return;

    if (!statusUpdateData.newStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setSaving(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setInspections(prev => prev.map(i => {
        if (i.id === selectedInspectionForStatus.id) {
          return {
            ...i,
            status: statusUpdateData.newStatus,
            notes: i.notes
              ? `${i.notes}\n\n[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
              : `[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
          };
        }
        return i;
      }));

      setShowStatusModal(false);
      setSelectedInspectionForStatus(null);
      setStatusUpdateData({ newStatus: '', remarks: '' });
      alert('Status updated successfully!');
    } catch (err: any) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async (inspectionsToDelete: MoveOutInspection[]) => {
    if (!confirm(`Delete ${inspectionsToDelete.length} inspection records permanently?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const idsToDelete = new Set(inspectionsToDelete.map(i => i.id));
      setInspections(prev => prev.filter(i => !idsToDelete.has(i.id)));
    } catch (err: any) {
      alert('Failed to delete inspections: ' + (err.message || 'Unknown error'));
    }
  };

  const handleView = async (inspection: MoveOutInspection) => {
    try {
      // Find full inspection with items
      const fullInspection = staticInspections.find(i => i.id === inspection.id) || inspection;
      setViewInspection(fullInspection);
      setShowViewModal(true);
    } catch (err: any) {
      alert('Failed to load inspection details: ' + (err.message || 'Unknown error'));
    }
  };

  const handleVerifyOTP = () => {
    if (!viewInspection) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setShowOTPModal(true);
    alert(`OTP sent to ${viewInspection.tenant_phone}\n\nOTP: ${otp}\n\n(In production, this would be sent via SMS)`);
  };

  const handleSubmitOTP = () => {
    if (otpCode === generatedOTP) {
      alert('✅ OTP Verified Successfully!\n\nInspection record is now confirmed.');
      setShowOTPModal(false);
      setOtpCode('');
      setGeneratedOTP('');
    } else {
      alert('❌ Invalid OTP. Please try again.');
    }
  };

  const handleDownloadPDF = () => {
    if (!viewInspection) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Move-Out Inspection Report', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 28, { align: 'center' });

      let yPos = 40;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenant Information', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tenant Name: ${viewInspection.tenant_name}`, 14, yPos);
      yPos += 6;
      doc.text(`Phone: ${viewInspection.tenant_phone}`, 14, yPos);
      yPos += 6;
      doc.text(`Property: ${viewInspection.property_name}`, 14, yPos);
      yPos += 6;
      doc.text(`Room: ${viewInspection.room_number}${viewInspection.bed_number ? ` / Bed ${viewInspection.bed_number}` : ''}`, 14, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Details', 14, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Inspection Date: ${dateFormatter(viewInspection.inspection_date)}`, 14, yPos);
      yPos += 6;
      doc.text(`Inspector: ${viewInspection.inspector_name}`, 14, yPos);
      yPos += 6;
      doc.text(`Status: ${viewInspection.status}`, 14, yPos);
      yPos += 10;

      if (viewInspection.inspection_items && viewInspection.inspection_items.length > 0) {
        const tableData = viewInspection.inspection_items.map(item => [
          item.item_name,
          item.category,
          item.quantity.toString(),
          item.condition_at_movein,
          item.condition_at_moveout,
          currencyFormatter.format(item.penalty_amount || 0),
          item.notes || '-'
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Item Name', 'Category', 'Qty', 'Move-in', 'Move-out', 'Penalty', 'Notes']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 25 },
            2: { cellWidth: 15 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 25 },
            6: { cellWidth: 'auto' }
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Penalty: ${currencyFormatter.format(viewInspection.total_penalty || 0)}`, 14, yPos);

      if (viewInspection.notes) {
        yPos += 10;
        doc.setFontSize(10);
        doc.text('Notes:', 14, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        const splitNotes = doc.splitTextToSize(viewInspection.notes, pageWidth - 28);
        doc.text(splitNotes, 14, yPos);
      }

      doc.save(`MoveOut_Inspection_${viewInspection.tenant_name}_${viewInspection.inspection_date}.pdf`);
      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    if (!viewInspection) return;

    try {
      const phone = viewInspection.tenant_phone.replace(/\D/g, '');

      if (!phone || phone.length < 10) {
        alert('Invalid phone number. Please check tenant phone number.');
        return;
      }

      const message = `🏢 *Move-Out Inspection Report*\n\n` +
        `📋 *Tenant Details*\n` +
        `Name: ${viewInspection.tenant_name}\n` +
        `Property: ${viewInspection.property_name}\n` +
        `Room: ${viewInspection.room_number}${viewInspection.bed_number ? ` / Bed ${viewInspection.bed_number}` : ''}\n\n` +
        `📅 *Inspection Details*\n` +
        `Date: ${dateFormatter(viewInspection.inspection_date)}\n` +
        `Inspector: ${viewInspection.inspector_name}\n` +
        `Status: ${viewInspection.status}\n\n` +
        `💰 *Total Penalty: ${currencyFormatter.format(viewInspection.total_penalty || 0)}*\n\n` +
        `📱 Items Inspected: ${viewInspection.inspection_items?.length || 0}\n\n` +
        `${viewInspection.notes ? `📝 Notes: ${viewInspection.notes}\n\n` : ''}` +
        `Thank you!`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

      const newWindow = window.open(whatsappUrl, '_blank');

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
        console.error('Pop-up was blocked by browser');
      } else {
        console.log('✅ WhatsApp opened successfully');
      }
    } catch (error) {
      console.error('❌ Error sharing via WhatsApp:', error);
      alert(`Failed to open WhatsApp. Error: ${error}`);
    }
  };

  const resetForm = () => {
    setFormData({
      handover_id: '',
      inspector_name: '',
      inspection_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setSelectedHandover(null);
    setInspectionItems([]);
    setEditingInspection(null);
    setCurrentStep(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
      case 'Active':
        return 'bg-blue-100 text-blue-700 border border-blue-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border border-amber-300';
      case 'Approved':
        return 'bg-green-100 text-green-700 border border-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-300';
    }
  };

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-100 text-green-700';
      case 'Good':
        return 'bg-blue-100 text-blue-700';
      case 'Used':
        return 'bg-yellow-100 text-yellow-700';
      case 'Damaged':
        return 'bg-orange-100 text-orange-700';
      case 'Missing':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
      key: 'inspection_date',
      label: 'Inspection Date',
      sortable: true,
      render: (row: MoveOutInspection) => dateFormatter(row.inspection_date)
    },
    {
      key: 'inspector_name',
      label: 'Inspector',
      sortable: true,
      searchable: true
    },
    {
      key: 'total_penalty',
      label: 'Total Penalty',
      sortable: true,
      render: (row: MoveOutInspection) => (
        <span className={`font-bold ${row.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {currencyFormatter.format(row.total_penalty || 0)}
        </span>
      )
    },
    {
      key: 'inspection_items',
      label: 'Items Inspected',
      sortable: false,
      render: (row: MoveOutInspection) => (
        <span className="font-semibold">{row.inspection_items?.length || 0}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: MoveOutInspection) => (
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
      render: (row: MoveOutInspection) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleView(row)}
            className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-bold hover:bg-cyan-200 transition-colors"
          >
            View
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      )
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
            onClick={loadInspections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Move-Out Inspections
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Inspect rooms and calculate penalties on move-out</p>
      </div>

      <DataTable
        data={inspections}
        columns={columns}
        onAdd={handleAdd}
        onExport={() => { }}
        title="Move-Out Inspections"
        addButtonText="New Inspection"
        rowKey="id"
        enableBulkActions={true}
        onBulkDelete={handleBulkDelete}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingInspection ? 'Edit' : 'New'} Move-Out Inspection
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingInspection ? 'Update inspection details and item conditions' : `Step ${currentStep} of 2 - ${currentStep === 1 ? 'Select Handover' : 'Inspect Items'}`}
                  </p>
                </div>
                <button
                  onClick={() => { setShowModal(false); }}
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
                  <span className="text-sm font-bold">Select Handover</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                  <div className={`w-5 h-5 rounded-full ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'
                    } flex items-center justify-center text-xs font-bold`}>2</div>
                  <span className="text-sm font-bold">Inspect Items</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-semibold">
                          Select an active tenant handover to begin the move-out inspection.
                          All items from the handover will be loaded for inspection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Select Tenant Handover <span className="text-red-600">*</span>
                    </label>
                    {loadingHandovers ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.handover_id}
                        onChange={(e) => {
                          setFormData({ ...formData, handover_id: e.target.value });
                          handleSelectHandover(e.target.value);
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="">-- Select a handover --</option>
                        {activeHandovers.map(handover => (
                          <option key={handover.id} value={handover.id}>
                            {handover.tenant_name} - {handover.property_name} Room {handover.room_number}
                            {handover.bed_number ? ` Bed ${handover.bed_number}` : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {selectedHandover && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-gray-900 mb-3">Handover Details</h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Tenant Name:</span>
                          <span className="ml-2 font-semibold">{selectedHandover.tenant_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phone:</span>
                          <span className="ml-2 font-semibold">{selectedHandover.tenant_phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Property:</span>
                          <span className="ml-2 font-semibold">{selectedHandover.property_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Room:</span>
                          <span className="ml-2 font-semibold">
                            {selectedHandover.room_number}
                            {selectedHandover.bed_number ? ` / Bed ${selectedHandover.bed_number}` : ''}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Move-in Date:</span>
                          <span className="ml-2 font-semibold">{dateFormatter(selectedHandover.move_in_date)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {loadingItems && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                      <span className="ml-2 text-gray-600">Loading handover items...</span>
                    </div>
                  )}

                  {inspectionItems.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-semibold">
                        Loaded {inspectionItems.length} item(s) for inspection
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
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
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">
                        Inspection Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.inspection_date}
                        onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
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
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-semibold mb-2">
                          Inspect each item and select its condition at move-out. Penalties will be calculated automatically
                          based on condition changes.
                        </p>
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <div className="text-lg font-bold text-gray-900">
                            Total Penalty: <span className={getTotalPenalty() > 0 ? 'text-red-600' : 'text-green-600'}>
                              {currencyFormatter.format(getTotalPenalty())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {inspectionItems.map((item, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{item.item_name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Category: <span className="font-semibold">{item.category}</span> |
                            Quantity: <span className="font-semibold">{item.quantity}</span>
                          </div>
                        </div>
                        {item.penalty_amount > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1">
                            <div className="text-xs text-red-600 font-semibold">Penalty</div>
                            <div className="text-lg font-bold text-red-600">
                              {currencyFormatter.format(item.penalty_amount)}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Condition at Move-in
                          </label>
                          <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${getConditionBadgeClass(item.condition_at_movein)}`}>
                            {item.condition_at_movein}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Condition at Move-out <span className="text-red-600">*</span>
                          </label>
                          <select
                            required
                            value={item.condition_at_moveout}
                            onChange={(e) => updateInspectionItem(index, 'condition_at_moveout', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                          >
                            {CONDITIONS.map(cond => (
                              <option key={cond} value={cond}>{cond}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Custom Penalty Amount (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.penalty_amount}
                            onChange={(e) => updateInspectionItem(index, 'penalty_amount', Number(e.target.value))}
                            className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-semibold focus:outline-none focus:border-amber-500"
                            placeholder="Override auto-calculated"
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                          Notes / Damage Description
                        </label>
                        <textarea
                          value={item.notes || ''}
                          onChange={(e) => updateInspectionItem(index, 'notes', e.target.value)}
                          rows={2}
                          placeholder="Describe any damage or issues..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
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
                        Complete Inspection
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && viewInspection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)} data-print-modal>
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-black text-gray-900">Move-Out Inspection Report</h2>
                <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg no-print">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Printer className="w-4 h-4" />
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
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <Printer className="w-4 h-4" />
                  Print Page
                </button>
                <button
                  onClick={handleVerifyOTP}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify with OTP
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Tenant Name</div>
                  <div className="font-bold text-gray-900">{viewInspection.tenant_name}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="font-bold text-gray-900">{viewInspection.tenant_phone}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Property</div>
                  <div className="font-bold text-gray-900">{viewInspection.property_name}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Room / Bed</div>
                  <div className="font-bold text-gray-900">
                    {viewInspection.room_number} {viewInspection.bed_number ? `/ ${viewInspection.bed_number}` : ''}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Inspection Date</div>
                  <div className="font-bold text-gray-900">{dateFormatter(viewInspection.inspection_date)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Inspector Name</div>
                  <div className="font-bold text-gray-900">{viewInspection.inspector_name}</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
                  <div className="text-sm text-red-600 mb-1 font-bold">Total Penalty Amount</div>
                  <div className="font-black text-2xl text-red-600">{currencyFormatter.format(viewInspection.total_penalty || 0)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass(viewInspection.status)}`}>
                      {viewInspection.status}
                    </span>
                  </div>
                </div>
              </div>

              {viewInspection.inspection_items && viewInspection.inspection_items.length > 0 && (
                <div>
                  <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center justify-between">
                    <span>Inspection Checklist</span>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {viewInspection.inspection_items.length} Items
                    </span>
                  </h3>
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">#</th>
                          <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Item Name</th>
                          <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Category</th>
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Qty</th>
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Move-in</th>
                          <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Move-out</th>
                          <th className="px-4 py-3 text-right text-sm font-bold border-r border-blue-500">Penalty</th>
                          <th className="px-4 py-3 text-left text-sm font-bold">Damage Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewInspection.inspection_items.map((item, idx) => (
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
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(item.condition_at_movein)}`}>
                                {item.condition_at_movein}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center border-r border-gray-200">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(item.condition_at_moveout)}`}>
                                {item.condition_at_moveout}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600 border-r border-gray-200">
                              {currencyFormatter.format(item.penalty_amount || 0)}
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

              {viewInspection.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <h3 className="text-sm font-black text-amber-900 mb-2">Additional Notes</h3>
                  <p className="text-sm text-amber-800">{viewInspection.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                    <div className="font-bold text-gray-900">{viewInspection.tenant_name}</div>
                    <div className="text-sm text-gray-600">Tenant Signature</div>
                    <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(viewInspection.inspection_date)}</div>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
                    <div className="font-bold text-gray-900">{viewInspection.inspector_name}</div>
                    <div className="text-sm text-gray-600">Inspector/Manager Signature</div>
                    <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(viewInspection.inspection_date)}</div>
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
                  This is an official move-out inspection document. By signing, both parties acknowledge the accuracy of the inspection results and penalty amounts.
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  Status: <span className={`font-bold ${viewInspection.status === 'Completed' ? 'text-green-700' : 'text-amber-700'}`}>
                    {viewInspection.status}
                  </span>
                  {viewInspection.total_penalty > 0 && (
                    <span className="ml-3">
                      | Total Penalty: <span className="font-bold text-red-700">{currencyFormatter.format(viewInspection.total_penalty)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOTPModal && viewInspection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowOTPModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Verify OTP</h2>
              <button onClick={() => setShowOTPModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-semibold">
                  OTP has been sent to {viewInspection.tenant_phone}
                </p>
                <p className="text-xs text-blue-600 mt-1">Please enter the 6-digit code to verify this inspection</p>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Enter OTP <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-bold text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOTPModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOTP}
                  disabled={otpCode.length !== 6}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedInspectionForStatus && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">Update Status</h2>
                  <p className="text-sm text-emerald-100 mt-1">Approve and change inspection status</p>
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
                    <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.tenant_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Property:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.property_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Room:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.room_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Inspection Date:</span>
                    <p className="font-bold text-gray-900 mt-0.5">{dateFormatter(selectedInspectionForStatus.inspection_date)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Penalty:</span>
                    <p className="font-bold text-red-600 mt-0.5">{currencyFormatter.format(selectedInspectionForStatus.total_penalty)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Status:</span>
                    <p className="mt-0.5">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedInspectionForStatus.status)}`}>
                        {selectedInspectionForStatus.status}
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
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Approved">Approved</option>
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
                  This will be added to the inspection notes with timestamp.
                </p>
              </div>

              {statusUpdateData.newStatus !== selectedInspectionForStatus.status && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 text-sm">Status Change</div>
                      <div className="text-sm text-amber-800 mt-1">
                        Status will change from <span className="font-bold">{selectedInspectionForStatus.status}</span> to{' '}
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
    </div>
  );
}