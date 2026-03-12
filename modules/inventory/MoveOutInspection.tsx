// import { useEffect, useState } from 'react';
// import { Plus, Loader2, X, ChevronRight, ChevronLeft, Check, AlertCircle, Eye, ShieldCheck, Printer, MessageCircle } from 'lucide-react';
// import { DataTable } from '../../components/common/DataTable';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// interface MoveOutInspection {
//   id: string;
//   handover_id: string;
//   tenant_name: string;
//   tenant_phone: string;
//   property_name: string;
//   room_number: string;
//   bed_number?: string;
//   inspection_date: string;
//   inspector_name: string;
//   total_penalty: number;
//   notes?: string;
//   status: string;
//   inspection_items?: InspectionItem[];
// }

// interface InspectionItem {
//   id?: string;
//   inspection_id?: string;
//   handover_item_id: string;
//   item_name: string;
//   category: string;
//   quantity: number;
//   condition_at_movein: string;
//   condition_at_moveout: string;
//   penalty_amount: number;
//   notes?: string;
// }

// interface TenantHandover {
//   id: string;
//   tenant_name: string;
//   tenant_phone: string;
//   property_name: string;
//   room_number: string;
//   bed_number?: string;
//   move_in_date: string;
//   status: string;
// }

// interface HandoverItem {
//   id: string;
//   handover_id: string;
//   item_name: string;
//   category: string;
//   quantity: number;
//   condition_at_movein: string;
//   notes?: string;
// }

// interface PenaltyRule {
//   id: string;
//   item_category: string;
//   from_condition: string;
//   to_condition: string;
//   penalty_amount: number;
// }

// const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

// const currencyFormatter = new Intl.NumberFormat('en-IN', {
//   style: 'currency',
//   currency: 'INR'
// });

// const dateFormatter = (date: string) => {
//   if (!date) return 'N/A';
//   return new Date(date).toLocaleDateString('en-IN');
// };

// // Static data
// const staticPenaltyRules: PenaltyRule[] = [
//   { id: '1', item_category: 'Furniture', from_condition: 'New', to_condition: 'Used', penalty_amount: 2000 },
//   { id: '2', item_category: 'Furniture', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 5000 },
//   { id: '3', item_category: 'Furniture', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 3000 },
//   { id: '4', item_category: 'Furniture', from_condition: 'New', to_condition: 'Missing', penalty_amount: 10000 },
//   { id: '5', item_category: 'Appliances', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 4000 },
//   { id: '6', item_category: 'Appliances', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 2500 },
//   { id: '7', item_category: 'Appliances', from_condition: 'New', to_condition: 'Missing', penalty_amount: 8000 },
//   { id: '8', item_category: 'Bedding', from_condition: 'New', to_condition: 'Used', penalty_amount: 500 },
//   { id: '9', item_category: 'Bedding', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 800 },
//   { id: '10', item_category: 'Bedding', from_condition: 'New', to_condition: 'Missing', penalty_amount: 2000 },
// ];

// const staticHandovers: TenantHandover[] = [
//   {
//     id: '1',
//     tenant_name: 'Rahul Sharma',
//     tenant_phone: '9876543210',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     bed_number: 'A',
//     move_in_date: '2026-01-15',
//     status: 'Active'
//   },
//   {
//     id: '2',
//     tenant_name: 'Priya Patel',
//     tenant_phone: '8765432109',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     bed_number: 'B',
//     move_in_date: '2026-02-01',
//     status: 'Active'
//   },
//   {
//     id: '3',
//     tenant_name: 'Amit Kumar',
//     tenant_phone: '7654321098',
//     property_name: 'Garden Heights',
//     room_number: '302',
//     move_in_date: '2026-02-15',
//     status: 'Pending'
//   },
//   {
//     id: '4',
//     tenant_name: 'Neha Singh',
//     tenant_phone: '6543210987',
//     property_name: 'Lakeview Residency',
//     room_number: '415',
//     bed_number: 'C',
//     move_in_date: '2026-01-20',
//     status: 'Active'
//   },
//   {
//     id: '5',
//     tenant_name: 'Vikram Mehta',
//     tenant_phone: '5432109876',
//     property_name: 'Sunset Villa',
//     room_number: '203',
//     move_in_date: '2026-02-10',
//     status: 'Active'
//   }
// ];

// const staticHandoverItems: Record<string, HandoverItem[]> = {
//   '1': [
//     { id: '101', handover_id: '1', item_name: 'King Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '102', handover_id: '1', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '103', handover_id: '1', item_name: 'Wardrobe', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '104', handover_id: '1', item_name: 'Study Table', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '105', handover_id: '1', item_name: 'Chair', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//   ],
//   '2': [
//     { id: '201', handover_id: '2', item_name: 'Queen Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '202', handover_id: '2', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '203', handover_id: '2', item_name: 'Refrigerator', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '204', handover_id: '2', item_name: 'Microwave', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
//   ],
//   '3': [
//     { id: '301', handover_id: '3', item_name: 'Single Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Used', notes: '' },
//     { id: '302', handover_id: '3', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Used', notes: '' },
//     { id: '303', handover_id: '3', item_name: 'Study Desk', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//   ],
//   '4': [
//     { id: '401', handover_id: '4', item_name: 'King Size Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '402', handover_id: '4', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '403', handover_id: '4', item_name: 'Washing Machine', category: 'Appliances', quantity: 1, condition_at_movein: 'New', notes: '' },
//     { id: '404', handover_id: '4', item_name: 'TV', category: 'Electronics', quantity: 1, condition_at_movein: 'Good', notes: '' },
//   ],
//   '5': [
//     { id: '501', handover_id: '5', item_name: 'Double Bed', category: 'Furniture', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '502', handover_id: '5', item_name: 'Mattress', category: 'Bedding', quantity: 1, condition_at_movein: 'Good', notes: '' },
//     { id: '503', handover_id: '5', item_name: 'Desk', category: 'Furniture', quantity: 1, condition_at_movein: 'Used', notes: '' },
//   ]
// };

// const staticInspections: MoveOutInspection[] = [
//   {
//     id: '1001',
//     handover_id: '1',
//     tenant_name: 'Rahul Sharma',
//     tenant_phone: '9876543210',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     bed_number: 'A',
//     inspection_date: '2026-03-15',
//     inspector_name: 'Sanjay Gupta',
//     total_penalty: 3500,
//     notes: 'Minor damages to furniture',
//     status: 'Completed',
//     inspection_items: [
//       {
//         id: '10001',
//         inspection_id: '1001',
//         handover_item_id: '101',
//         item_name: 'King Size Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'New',
//         condition_at_moveout: 'Good',
//         penalty_amount: 2000,
//         notes: 'Small scratch on headboard'
//       },
//       {
//         id: '10002',
//         inspection_id: '1001',
//         handover_item_id: '102',
//         item_name: 'Mattress',
//         category: 'Bedding',
//         quantity: 1,
//         condition_at_movein: 'New',
//         condition_at_moveout: 'Used',
//         penalty_amount: 500,
//         notes: 'Normal wear'
//       },
//       {
//         id: '10003',
//         inspection_id: '1001',
//         handover_item_id: '103',
//         item_name: 'Wardrobe',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Good',
//         penalty_amount: 0,
//         notes: 'Good condition'
//       },
//       {
//         id: '10004',
//         inspection_id: '1001',
//         handover_item_id: '104',
//         item_name: 'Study Table',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Damaged',
//         penalty_amount: 1000,
//         notes: 'Broken leg'
//       }
//     ]
//   },
//   {
//     id: '1002',
//     handover_id: '2',
//     tenant_name: 'Priya Patel',
//     tenant_phone: '8765432109',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     bed_number: 'B',
//     inspection_date: '2026-03-10',
//     inspector_name: 'Anjali Desai',
//     total_penalty: 0,
//     notes: 'All items in good condition',
//     status: 'Approved',
//     inspection_items: [
//       {
//         id: '20001',
//         inspection_id: '1002',
//         handover_item_id: '201',
//         item_name: 'Queen Size Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Good',
//         penalty_amount: 0,
//         notes: ''
//       },
//       {
//         id: '20002',
//         inspection_id: '1002',
//         handover_item_id: '202',
//         item_name: 'Mattress',
//         category: 'Bedding',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Good',
//         penalty_amount: 0,
//         notes: ''
//       },
//       {
//         id: '20003',
//         inspection_id: '1002',
//         handover_item_id: '203',
//         item_name: 'Refrigerator',
//         category: 'Appliances',
//         quantity: 1,
//         condition_at_movein: 'New',
//         condition_at_moveout: 'Good',
//         penalty_amount: 0,
//         notes: 'Working properly'
//       }
//     ]
//   },
//   {
//     id: '1003',
//     handover_id: '3',
//     tenant_name: 'Amit Kumar',
//     tenant_phone: '7654321098',
//     property_name: 'Garden Heights',
//     room_number: '302',
//     inspection_date: '2026-03-05',
//     inspector_name: 'Vikram Singh',
//     total_penalty: 5500,
//     notes: 'Damages and missing items',
//     status: 'Pending',
//     inspection_items: [
//       {
//         id: '30001',
//         inspection_id: '1003',
//         handover_item_id: '301',
//         item_name: 'Single Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         condition_at_moveout: 'Damaged',
//         penalty_amount: 2500,
//         notes: 'Broken slats'
//       },
//       {
//         id: '30002',
//         inspection_id: '1003',
//         handover_item_id: '302',
//         item_name: 'Mattress',
//         category: 'Bedding',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         condition_at_moveout: 'Damaged',
//         penalty_amount: 800,
//         notes: 'Stains and tears'
//       },
//       {
//         id: '30003',
//         inspection_id: '1003',
//         handover_item_id: '303',
//         item_name: 'Study Desk',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Missing',
//         penalty_amount: 2200,
//         notes: 'Item not found'
//       }
//     ]
//   },
//   {
//     id: '1004',
//     handover_id: '4',
//     tenant_name: 'Neha Singh',
//     tenant_phone: '6543210987',
//     property_name: 'Lakeview Residency',
//     room_number: '415',
//     bed_number: 'C',
//     inspection_date: '2026-03-12',
//     inspector_name: 'Rajesh Kumar',
//     total_penalty: 8000,
//     notes: 'Major appliance damage',
//     status: 'Active',
//     inspection_items: [
//       {
//         id: '40001',
//         inspection_id: '1004',
//         handover_item_id: '403',
//         item_name: 'Washing Machine',
//         category: 'Appliances',
//         quantity: 1,
//         condition_at_movein: 'New',
//         condition_at_moveout: 'Damaged',
//         penalty_amount: 8000,
//         notes: 'Not working, water damage'
//       }
//     ]
//   },
//   {
//     id: '1005',
//     handover_id: '5',
//     tenant_name: 'Vikram Mehta',
//     tenant_phone: '5432109876',
//     property_name: 'Sunset Villa',
//     room_number: '203',
//     inspection_date: '2026-03-08',
//     inspector_name: 'Sanjay Gupta',
//     total_penalty: 500,
//     notes: 'Minor issues',
//     status: 'Completed',
//     inspection_items: [
//       {
//         id: '50001',
//         inspection_id: '1005',
//         handover_item_id: '502',
//         item_name: 'Mattress',
//         category: 'Bedding',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         condition_at_moveout: 'Damaged',
//         penalty_amount: 500,
//         notes: 'Small tear'
//       }
//     ]
//   }
// ];

// export function MoveOutInspection() {
//   const [inspections, setInspections] = useState<MoveOutInspection[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [saving, setSaving] = useState(false);
//   const [loadingHandovers, setLoadingHandovers] = useState(false);
//   const [loadingItems, setLoadingItems] = useState(false);
//   const [editingInspection, setEditingInspection] = useState<MoveOutInspection | null>(null);

//   const [activeHandovers, setActiveHandovers] = useState<TenantHandover[]>([]);
//   const [selectedHandover, setSelectedHandover] = useState<TenantHandover | null>(null);

//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [viewInspection, setViewInspection] = useState<MoveOutInspection | null>(null);
//   const [selectedInspectionForStatus, setSelectedInspectionForStatus] = useState<MoveOutInspection | null>(null);
//   const [otpCode, setOtpCode] = useState('');
//   const [generatedOTP, setGeneratedOTP] = useState('');
//   const [statusUpdateData, setStatusUpdateData] = useState({
//     newStatus: '',
//     remarks: ''
//   });

//   const [formData, setFormData] = useState({
//     handover_id: '',
//     inspector_name: '',
//     inspection_date: new Date().toISOString().split('T')[0],
//     notes: ''
//   });

//   const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

//   useEffect(() => {
//     loadInspections();
//   }, []);

//   const loadInspections = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 800));
//       setInspections(staticInspections);
//     } catch (err: any) {
//       setError(err.message || 'Failed to load move-out inspections');
//       console.error('Error loading move-out inspections:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadActiveHandovers = async () => {
//     try {
//       setLoadingHandovers(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 500));
//       // Filter for Active or Pending handovers
//       const active = staticHandovers.filter(h => h.status === 'Active' || h.status === 'Pending');
//       setActiveHandovers(active);
//     } catch (err: any) {
//       alert('Failed to load handovers: ' + (err.message || 'Unknown error'));
//     } finally {
//       setLoadingHandovers(false);
//     }
//   };

//   const handleAdd = async () => {
//     resetForm();
//     setCurrentStep(1);
//     setShowModal(true);
//     await loadActiveHandovers();
//   };

//   const handleSelectHandover = async (handoverId: string) => {
//     if (!handoverId) {
//       setSelectedHandover(null);
//       setInspectionItems([]);
//       return;
//     }

//     try {
//       setLoadingItems(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 600));

//       // Get handover details
//       const handover = staticHandovers.find(h => h.id === handoverId) || null;
//       setSelectedHandover(handover);

//       // Get handover items
//       const items = staticHandoverItems[handoverId] || [];

//       // Initialize inspection items with zero penalty
//       const initialInspectionItems: InspectionItem[] = items.map(item => ({
//         handover_item_id: item.id,
//         item_name: item.item_name,
//         category: item.category,
//         quantity: item.quantity,
//         condition_at_movein: item.condition_at_movein,
//         condition_at_moveout: item.condition_at_movein, // Default to same condition
//         penalty_amount: 0,
//         notes: ''
//       }));

//       setInspectionItems(initialInspectionItems);
//     } catch (err: any) {
//       alert('Failed to load handover items: ' + (err.message || 'Unknown error'));
//     } finally {
//       setLoadingItems(false);
//     }
//   };

//   const calculatePenalty = async (
//     category: string,
//     fromCondition: string,
//     toCondition: string
//   ): Promise<number> => {
//     try {
//       // If condition didn't change, no penalty
//       if (fromCondition === toCondition) {
//         return 0;
//       }

//       // If item is missing, get the highest penalty for that category
//       if (toCondition === 'Missing') {
//         const categoryRules = staticPenaltyRules.filter(r => r.item_category === category);
//         if (categoryRules.length === 0) return 1000; // Default penalty if no rules
//         return Math.max(...categoryRules.map(r => r.penalty_amount || 0));
//       }

//       // Otherwise, look up the penalty rule
//       const rule = staticPenaltyRules.find(r =>
//         r.item_category === category &&
//         r.from_condition === fromCondition &&
//         r.to_condition === toCondition
//       );
//       return rule?.penalty_amount || 0;
//     } catch (err) {
//       console.error('Error calculating penalty:', err);
//       return 0;
//     }
//   };

//   const updateInspectionItem = async (
//     index: number,
//     field: keyof InspectionItem,
//     value: any
//   ) => {
//     const newItems = [...inspectionItems];
//     newItems[index] = { ...newItems[index], [field]: value };

//     // If condition changed, recalculate penalty
//     if (field === 'condition_at_moveout') {
//       const item = newItems[index];
//       const penalty = await calculatePenalty(
//         item.category,
//         item.condition_at_movein,
//         value
//       );
//       newItems[index].penalty_amount = penalty;
//     }

//     setInspectionItems(newItems);
//   };

//   const getTotalPenalty = () => {
//     return inspectionItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
//   };

//   const validateStep1 = () => {
//     if (!formData.handover_id) {
//       alert('Please select a tenant handover');
//       return false;
//     }
//     if (!formData.inspector_name.trim()) {
//       alert('Please enter inspector name');
//       return false;
//     }
//     if (!formData.inspection_date) {
//       alert('Please select inspection date');
//       return false;
//     }
//     if (inspectionItems.length === 0) {
//       alert('Selected handover has no items to inspect');
//       return false;
//     }
//     return true;
//   };

//   const validateStep2 = () => {
//     for (let i = 0; i < inspectionItems.length; i++) {
//       const item = inspectionItems[i];
//       if (!item.condition_at_moveout) {
//         alert(`Please select move-out condition for item ${i + 1}: ${item.item_name}`);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (currentStep === 1) {
//       if (validateStep1()) {
//         setCurrentStep(2);
//       }
//     }
//   };

//   const handlePrevious = () => {
//     if (currentStep === 2) {
//       setCurrentStep(1);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validateStep2()) {
//       return;
//     }

//     try {
//       setSaving(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 800));

//       const totalPenalty = getTotalPenalty();

//       if (editingInspection) {
//         // Update existing inspection
//         const updatedInspection: MoveOutInspection = {
//           ...editingInspection,
//           inspection_date: formData.inspection_date,
//           inspector_name: formData.inspector_name,
//           total_penalty: totalPenalty,
//           notes: formData.notes,
//           inspection_items: inspectionItems.map((item, index) => ({
//             ...item,
//             id: editingInspection.inspection_items?.[index]?.id || `${Date.now()}-${index}`,
//             inspection_id: editingInspection.id
//           }))
//         };

//         setInspections(prev => prev.map(i => i.id === editingInspection.id ? updatedInspection : i));

//         alert(`Inspection updated successfully!\n\nTotal Penalty: ${currencyFormatter.format(totalPenalty)}`);
//       } else {
//         // Create new inspection record
//         const newInspection: MoveOutInspection = {
//           id: `${Date.now()}`,
//           handover_id: formData.handover_id,
//           tenant_name: selectedHandover?.tenant_name || '',
//           tenant_phone: selectedHandover?.tenant_phone || '',
//           property_name: selectedHandover?.property_name || '',
//           room_number: selectedHandover?.room_number || '',
//           bed_number: selectedHandover?.bed_number || '',
//           inspection_date: formData.inspection_date,
//           inspector_name: formData.inspector_name,
//           total_penalty: totalPenalty,
//           notes: formData.notes,
//           status: 'Completed',
//           inspection_items: inspectionItems.map((item, index) => ({
//             ...item,
//             id: `${Date.now()}-${index}`,
//             inspection_id: `${Date.now()}`
//           }))
//         };

//         setInspections(prev => [newInspection, ...prev]);

//         alert(
//           `Inspection completed successfully!\n\n` +
//           `Total Penalty: ${currencyFormatter.format(totalPenalty)}\n` +
//           `Items Inspected: ${inspectionItems.length}`
//         );
//       }

//       setShowModal(false);
//       resetForm();
//     } catch (err: any) {
//       alert('Failed to save inspection: ' + (err.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleEdit = async (inspection: MoveOutInspection) => {
//     try {
//       setEditingInspection(inspection);
//       setCurrentStep(2); // Skip to step 2 since handover is already selected

//       // Find full inspection with items
//       const fullInspection = staticInspections.find(i => i.id === inspection.id) || inspection;

//       setFormData({
//         handover_id: inspection.handover_id,
//         inspector_name: inspection.inspector_name,
//         inspection_date: inspection.inspection_date,
//         notes: inspection.notes || ''
//       });

//       // Set selected handover info
//       setSelectedHandover({
//         id: inspection.handover_id,
//         tenant_name: inspection.tenant_name,
//         tenant_phone: inspection.tenant_phone,
//         property_name: inspection.property_name,
//         room_number: inspection.room_number,
//         bed_number: inspection.bed_number || '',
//         move_in_date: '',
//         status: 'Active'
//       });

//       // Load inspection items
//       if (fullInspection.inspection_items && fullInspection.inspection_items.length > 0) {
//         setInspectionItems(fullInspection.inspection_items);
//       } else {
//         setInspectionItems([]);
//       }

//       setShowModal(true);
//     } catch (err: any) {
//       alert('Failed to load inspection for editing: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleDelete = async (inspection: MoveOutInspection) => {
//     if (!confirm('Delete this inspection record permanently? This will also delete all associated items.')) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 400));
//       setInspections(prev => prev.filter(i => i.id !== inspection.id));
//     } catch (err: any) {
//       alert('Failed to delete inspection: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleOpenStatusModal = (inspection: MoveOutInspection) => {
//     setSelectedInspectionForStatus(inspection);
//     setStatusUpdateData({
//       newStatus: inspection.status,
//       remarks: ''
//     });
//     setShowStatusModal(true);
//   };

//   const handleUpdateStatus = async () => {
//     if (!selectedInspectionForStatus) return;

//     if (!statusUpdateData.newStatus) {
//       alert('Please select a status');
//       return;
//     }

//     try {
//       setSaving(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 500));

//       setInspections(prev => prev.map(i => {
//         if (i.id === selectedInspectionForStatus.id) {
//           return {
//             ...i,
//             status: statusUpdateData.newStatus,
//             notes: i.notes
//               ? `${i.notes}\n\n[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
//               : `[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
//           };
//         }
//         return i;
//       }));

//       setShowStatusModal(false);
//       setSelectedInspectionForStatus(null);
//       setStatusUpdateData({ newStatus: '', remarks: '' });
//       alert('Status updated successfully!');
//     } catch (err: any) {
//       alert('Failed to update status: ' + (err.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleBulkDelete = async (inspectionsToDelete: MoveOutInspection[]) => {
//     if (!confirm(`Delete ${inspectionsToDelete.length} inspection records permanently?`)) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 600));
//       const idsToDelete = new Set(inspectionsToDelete.map(i => i.id));
//       setInspections(prev => prev.filter(i => !idsToDelete.has(i.id)));
//     } catch (err: any) {
//       alert('Failed to delete inspections: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleView = async (inspection: MoveOutInspection) => {
//     try {
//       // Find full inspection with items
//       const fullInspection = staticInspections.find(i => i.id === inspection.id) || inspection;
//       setViewInspection(fullInspection);
//       setShowViewModal(true);
//     } catch (err: any) {
//       alert('Failed to load inspection details: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleVerifyOTP = () => {
//     if (!viewInspection) return;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     setGeneratedOTP(otp);
//     setShowOTPModal(true);
//     alert(`OTP sent to ${viewInspection.tenant_phone}\n\nOTP: ${otp}\n\n(In production, this would be sent via SMS)`);
//   };

//   const handleSubmitOTP = () => {
//     if (otpCode === generatedOTP) {
//       alert('✅ OTP Verified Successfully!\n\nInspection record is now confirmed.');
//       setShowOTPModal(false);
//       setOtpCode('');
//       setGeneratedOTP('');
//     } else {
//       alert('❌ Invalid OTP. Please try again.');
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!viewInspection) return;

//     try {
//       const doc = new jsPDF();
//       const pageWidth = doc.internal.pageSize.width;

//       doc.setFontSize(20);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Move-Out Inspection Report', pageWidth / 2, 20, { align: 'center' });

//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, 28, { align: 'center' });

//       let yPos = 40;

//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Tenant Information', 14, yPos);
//       yPos += 8;

//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Tenant Name: ${viewInspection.tenant_name}`, 14, yPos);
//       yPos += 6;
//       doc.text(`Phone: ${viewInspection.tenant_phone}`, 14, yPos);
//       yPos += 6;
//       doc.text(`Property: ${viewInspection.property_name}`, 14, yPos);
//       yPos += 6;
//       doc.text(`Room: ${viewInspection.room_number}${viewInspection.bed_number ? ` / Bed ${viewInspection.bed_number}` : ''}`, 14, yPos);
//       yPos += 10;

//       doc.setFont('helvetica', 'bold');
//       doc.text('Inspection Details', 14, yPos);
//       yPos += 8;

//       doc.setFont('helvetica', 'normal');
//       doc.text(`Inspection Date: ${dateFormatter(viewInspection.inspection_date)}`, 14, yPos);
//       yPos += 6;
//       doc.text(`Inspector: ${viewInspection.inspector_name}`, 14, yPos);
//       yPos += 6;
//       doc.text(`Status: ${viewInspection.status}`, 14, yPos);
//       yPos += 10;

//       if (viewInspection.inspection_items && viewInspection.inspection_items.length > 0) {
//         const tableData = viewInspection.inspection_items.map(item => [
//           item.item_name,
//           item.category,
//           item.quantity.toString(),
//           item.condition_at_movein,
//           item.condition_at_moveout,
//           currencyFormatter.format(item.penalty_amount || 0),
//           item.notes || '-'
//         ]);

//         autoTable(doc, {
//           startY: yPos,
//           head: [['Item Name', 'Category', 'Qty', 'Move-in', 'Move-out', 'Penalty', 'Notes']],
//           body: tableData,
//           theme: 'striped',
//           headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
//           styles: { fontSize: 9, cellPadding: 3 },
//           columnStyles: {
//             0: { cellWidth: 35 },
//             1: { cellWidth: 25 },
//             2: { cellWidth: 15 },
//             3: { cellWidth: 20 },
//             4: { cellWidth: 20 },
//             5: { cellWidth: 25 },
//             6: { cellWidth: 'auto' }
//           }
//         });

//         yPos = (doc as any).lastAutoTable.finalY + 10;
//       }

//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text(`Total Penalty: ${currencyFormatter.format(viewInspection.total_penalty || 0)}`, 14, yPos);

//       if (viewInspection.notes) {
//         yPos += 10;
//         doc.setFontSize(10);
//         doc.text('Notes:', 14, yPos);
//         yPos += 6;
//         doc.setFont('helvetica', 'normal');
//         const splitNotes = doc.splitTextToSize(viewInspection.notes, pageWidth - 28);
//         doc.text(splitNotes, 14, yPos);
//       }

//       doc.save(`MoveOut_Inspection_${viewInspection.tenant_name}_${viewInspection.inspection_date}.pdf`);
//       console.log('✅ PDF downloaded successfully');
//     } catch (error) {
//       console.error('❌ Error generating PDF:', error);
//       alert('Failed to generate PDF. Please try again.');
//     }
//   };

//   const handleShareWhatsApp = () => {
//     if (!viewInspection) return;

//     try {
//       const phone = viewInspection.tenant_phone.replace(/\D/g, '');

//       if (!phone || phone.length < 10) {
//         alert('Invalid phone number. Please check tenant phone number.');
//         return;
//       }

//       const message = `🏢 *Move-Out Inspection Report*\n\n` +
//         `📋 *Tenant Details*\n` +
//         `Name: ${viewInspection.tenant_name}\n` +
//         `Property: ${viewInspection.property_name}\n` +
//         `Room: ${viewInspection.room_number}${viewInspection.bed_number ? ` / Bed ${viewInspection.bed_number}` : ''}\n\n` +
//         `📅 *Inspection Details*\n` +
//         `Date: ${dateFormatter(viewInspection.inspection_date)}\n` +
//         `Inspector: ${viewInspection.inspector_name}\n` +
//         `Status: ${viewInspection.status}\n\n` +
//         `💰 *Total Penalty: ${currencyFormatter.format(viewInspection.total_penalty || 0)}*\n\n` +
//         `📱 Items Inspected: ${viewInspection.inspection_items?.length || 0}\n\n` +
//         `${viewInspection.notes ? `📝 Notes: ${viewInspection.notes}\n\n` : ''}` +
//         `Thank you!`;

//       const encodedMessage = encodeURIComponent(message);
//       const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;

//       const newWindow = window.open(whatsappUrl, '_blank');

//       if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
//         alert('Pop-up blocked! Please allow pop-ups for this site and try again.');
//         console.error('Pop-up was blocked by browser');
//       } else {
//         console.log('✅ WhatsApp opened successfully');
//       }
//     } catch (error) {
//       console.error('❌ Error sharing via WhatsApp:', error);
//       alert(`Failed to open WhatsApp. Error: ${error}`);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       handover_id: '',
//       inspector_name: '',
//       inspection_date: new Date().toISOString().split('T')[0],
//       notes: ''
//     });
//     setSelectedHandover(null);
//     setInspectionItems([]);
//     setEditingInspection(null);
//     setCurrentStep(1);
//   };

//   const getStatusBadgeClass = (status: string) => {
//     switch (status) {
//       case 'Completed':
//         return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
//       case 'Active':
//         return 'bg-blue-100 text-blue-700 border border-blue-300';
//       case 'Pending':
//         return 'bg-amber-100 text-amber-700 border border-amber-300';
//       case 'Approved':
//         return 'bg-green-100 text-green-700 border border-green-300';
//       case 'Cancelled':
//         return 'bg-red-100 text-red-700 border border-red-300';
//       default:
//         return 'bg-gray-100 text-gray-700 border border-gray-300';
//     }
//   };

//   const getConditionBadgeClass = (condition: string) => {
//     switch (condition) {
//       case 'New':
//         return 'bg-green-100 text-green-700';
//       case 'Good':
//         return 'bg-blue-100 text-blue-700';
//       case 'Used':
//         return 'bg-yellow-100 text-yellow-700';
//       case 'Damaged':
//         return 'bg-orange-100 text-orange-700';
//       case 'Missing':
//         return 'bg-red-100 text-red-700';
//       default:
//         return 'bg-gray-100 text-gray-700';
//     }
//   };

//   const columns = [
//     {
//       key: 'tenant_name',
//       label: 'Tenant Name',
//       sortable: true,
//       searchable: true
//     },
//     {
//       key: 'tenant_phone',
//       label: 'Phone',
//       sortable: true,
//       searchable: true
//     },
//     {
//       key: 'property_name',
//       label: 'Property',
//       sortable: true,
//       searchable: true
//     },
//     {
//       key: 'room_number',
//       label: 'Room',
//       sortable: true,
//       searchable: true
//     },
//     {
//       key: 'inspection_date',
//       label: 'Inspection Date',
//       sortable: true,
//       render: (row: MoveOutInspection) => dateFormatter(row.inspection_date)
//     },
//     {
//       key: 'inspector_name',
//       label: 'Inspector',
//       sortable: true,
//       searchable: true
//     },
//     {
//       key: 'total_penalty',
//       label: 'Total Penalty',
//       sortable: true,
//       render: (row: MoveOutInspection) => (
//         <span className={`font-bold ${row.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}`}>
//           {currencyFormatter.format(row.total_penalty || 0)}
//         </span>
//       )
//     },
//     {
//       key: 'inspection_items',
//       label: 'Items Inspected',
//       sortable: false,
//       render: (row: MoveOutInspection) => (
//         <span className="font-semibold">{row.inspection_items?.length || 0}</span>
//       )
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       sortable: true,
//       render: (row: MoveOutInspection) => (
//         <button
//           onClick={() => handleOpenStatusModal(row)}
//           className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all ${getStatusBadgeClass(row.status)}`}
//           title="Click to update status"
//         >
//           {row.status}
//         </button>
//       )
//     },
//     {
//       key: 'actions',
//       label: 'Actions',
//       sortable: false,
//       searchable: false,
//       render: (row: MoveOutInspection) => (
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleView(row)}
//             className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg text-sm font-bold hover:bg-cyan-200 transition-colors"
//           >
//             View
//           </button>
//           <button
//             onClick={() => handleEdit(row)}
//             className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
//           >
//             Edit
//           </button>
//           <button
//             onClick={() => handleDelete(row)}
//             className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors"
//           >
//             Delete
//           </button>
//         </div>
//       )
//     }
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <p className="text-red-600 font-semibold mb-2">Error: {error}</p>
//           <button
//             onClick={loadInspections}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full">
//       <div className="mb-6">
//         <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//           Move-Out Inspections
//         </h1>
//         <p className="text-gray-600 font-semibold mt-1">Inspect rooms and calculate penalties on move-out</p>
//       </div>

//       <DataTable
//         data={inspections}
//         columns={columns}
//         onAdd={handleAdd}
//         onExport={() => { }}
//         title="Move-Out Inspections"
//         addButtonText="New Inspection"
//         rowKey="id"
//         enableBulkActions={true}
//         onBulkDelete={handleBulkDelete}
//       />

//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl w-full max-w-5xl my-8 max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-gray-900">
//                     {editingInspection ? 'Edit' : 'New'} Move-Out Inspection
//                   </h2>
//                   <p className="text-sm text-gray-600 mt-1">
//                     {editingInspection ? 'Update inspection details and item conditions' : `Step ${currentStep} of 2 - ${currentStep === 1 ? 'Select Handover' : 'Inspect Items'}`}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => { setShowModal(false); }}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>

//               {/* Step Indicator */}
//               <div className="flex items-center gap-2 mt-4">
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 1 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
//                   }`}>
//                   {currentStep === 1 ? (
//                     <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
//                   ) : (
//                     <Check className="w-5 h-5" />
//                   )}
//                   <span className="text-sm font-bold">Select Handover</span>
//                 </div>
//                 <ChevronRight className="w-4 h-4 text-gray-400" />
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
//                   }`}>
//                   <div className={`w-5 h-5 rounded-full ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'
//                     } flex items-center justify-center text-xs font-bold`}>2</div>
//                   <span className="text-sm font-bold">Inspect Items</span>
//                 </div>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               {currentStep === 1 && (
//                 <div className="space-y-4">
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-blue-800 font-semibold">
//                           Select an active tenant handover to begin the move-out inspection.
//                           All items from the handover will be loaded for inspection.
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-1">
//                       Select Tenant Handover <span className="text-red-600">*</span>
//                     </label>
//                     {loadingHandovers ? (
//                       <div className="flex items-center justify-center py-8">
//                         <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
//                       </div>
//                     ) : (
//                       <select
//                         required
//                         value={formData.handover_id}
//                         onChange={(e) => {
//                           setFormData({ ...formData, handover_id: e.target.value });
//                           handleSelectHandover(e.target.value);
//                         }}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       >
//                         <option value="">-- Select a handover --</option>
//                         {activeHandovers.map(handover => (
//                           <option key={handover.id} value={handover.id}>
//                             {handover.tenant_name} - {handover.property_name} Room {handover.room_number}
//                             {handover.bed_number ? ` Bed ${handover.bed_number}` : ''}
//                           </option>
//                         ))}
//                       </select>
//                     )}
//                   </div>

//                   {selectedHandover && (
//                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//                       <h3 className="font-bold text-gray-900 mb-3">Handover Details</h3>
//                       <div className="grid md:grid-cols-2 gap-3 text-sm">
//                         <div>
//                           <span className="text-gray-600">Tenant Name:</span>
//                           <span className="ml-2 font-semibold">{selectedHandover.tenant_name}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Phone:</span>
//                           <span className="ml-2 font-semibold">{selectedHandover.tenant_phone}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Property:</span>
//                           <span className="ml-2 font-semibold">{selectedHandover.property_name}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Room:</span>
//                           <span className="ml-2 font-semibold">
//                             {selectedHandover.room_number}
//                             {selectedHandover.bed_number ? ` / Bed ${selectedHandover.bed_number}` : ''}
//                           </span>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Move-in Date:</span>
//                           <span className="ml-2 font-semibold">{dateFormatter(selectedHandover.move_in_date)}</span>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {loadingItems && (
//                     <div className="flex items-center justify-center py-8">
//                       <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
//                       <span className="ml-2 text-gray-600">Loading handover items...</span>
//                     </div>
//                   )}

//                   {inspectionItems.length > 0 && (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                       <p className="text-sm text-green-800 font-semibold">
//                         Loaded {inspectionItems.length} item(s) for inspection
//                       </p>
//                     </div>
//                   )}

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Inspector Name <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.inspector_name}
//                         onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Inspection Date <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={formData.inspection_date}
//                         onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
//                     <textarea
//                       value={formData.notes}
//                       onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                       rows={3}
//                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//               )}

//               {currentStep === 2 && (
//                 <div className="space-y-4">
//                   <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-sm text-amber-800 font-semibold mb-2">
//                           Inspect each item and select its condition at move-out. Penalties will be calculated automatically
//                           based on condition changes.
//                         </p>
//                         <div className="bg-white rounded-lg p-3 mt-2">
//                           <div className="text-lg font-bold text-gray-900">
//                             Total Penalty: <span className={getTotalPenalty() > 0 ? 'text-red-600' : 'text-green-600'}>
//                               {currencyFormatter.format(getTotalPenalty())}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {inspectionItems.map((item, index) => (
//                     <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
//                       <div className="flex items-start justify-between mb-3">
//                         <div>
//                           <div className="font-bold text-gray-900 text-lg">{item.item_name}</div>
//                           <div className="text-sm text-gray-600 mt-1">
//                             Category: <span className="font-semibold">{item.category}</span> |
//                             Quantity: <span className="font-semibold">{item.quantity}</span>
//                           </div>
//                         </div>
//                         {item.penalty_amount > 0 && (
//                           <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1">
//                             <div className="text-xs text-red-600 font-semibold">Penalty</div>
//                             <div className="text-lg font-bold text-red-600">
//                               {currencyFormatter.format(item.penalty_amount)}
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       <div className="grid md:grid-cols-3 gap-4">
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-2">
//                             Condition at Move-in
//                           </label>
//                           <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${getConditionBadgeClass(item.condition_at_movein)}`}>
//                             {item.condition_at_movein}
//                           </span>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-2">
//                             Condition at Move-out <span className="text-red-600">*</span>
//                           </label>
//                           <select
//                             required
//                             value={item.condition_at_moveout}
//                             onChange={(e) => updateInspectionItem(index, 'condition_at_moveout', e.target.value)}
//                             className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           >
//                             {CONDITIONS.map(cond => (
//                               <option key={cond} value={cond}>{cond}</option>
//                             ))}
//                           </select>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-2">
//                             Custom Penalty Amount (₹)
//                           </label>
//                           <input
//                             type="number"
//                             min="0"
//                             step="0.01"
//                             value={item.penalty_amount}
//                             onChange={(e) => updateInspectionItem(index, 'penalty_amount', Number(e.target.value))}
//                             className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg font-semibold focus:outline-none focus:border-amber-500"
//                             placeholder="Override auto-calculated"
//                           />
//                         </div>
//                       </div>

//                       <div className="mt-3">
//                         <label className="block text-sm font-bold text-gray-700 mb-1">
//                           Notes / Damage Description
//                         </label>
//                         <textarea
//                           value={item.notes || ''}
//                           onChange={(e) => updateInspectionItem(index, 'notes', e.target.value)}
//                           rows={2}
//                           placeholder="Describe any damage or issues..."
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
//                 {currentStep === 2 && (
//                   <button
//                     type="button"
//                     onClick={handlePrevious}
//                     className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors flex items-center gap-2"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                     Previous
//                   </button>
//                 )}
//                 {currentStep === 1 ? (
//                   <button
//                     type="button"
//                     onClick={handleNext}
//                     className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
//                   >
//                     Next
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {saving ? (
//                       <>
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Check className="w-5 h-5" />
//                         Complete Inspection
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showViewModal && viewInspection && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)} data-print-modal>
//           <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
//               <div className="flex items-center justify-between mb-3">
//                 <h2 className="text-2xl font-black text-gray-900">Move-Out Inspection Report</h2>
//                 <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg no-print">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2 print:hidden">
//                 <button
//                   onClick={handleDownloadPDF}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <Printer className="w-4 h-4" />
//                   Download PDF
//                 </button>
//                 <button
//                   onClick={handleShareWhatsApp}
//                   className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <MessageCircle className="w-4 h-4" />
//                   Share on WhatsApp
//                 </button>
//                 <button
//                   onClick={() => window.print()}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <Printer className="w-4 h-4" />
//                   Print Page
//                 </button>
//                 <button
//                   onClick={handleVerifyOTP}
//                   className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <ShieldCheck className="w-4 h-4" />
//                   Verify with OTP
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Tenant Name</div>
//                   <div className="font-bold text-gray-900">{viewInspection.tenant_name}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Phone</div>
//                   <div className="font-bold text-gray-900">{viewInspection.tenant_phone}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Property</div>
//                   <div className="font-bold text-gray-900">{viewInspection.property_name}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Room / Bed</div>
//                   <div className="font-bold text-gray-900">
//                     {viewInspection.room_number} {viewInspection.bed_number ? `/ ${viewInspection.bed_number}` : ''}
//                   </div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Inspection Date</div>
//                   <div className="font-bold text-gray-900">{dateFormatter(viewInspection.inspection_date)}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Inspector Name</div>
//                   <div className="font-bold text-gray-900">{viewInspection.inspector_name}</div>
//                 </div>
//                 <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
//                   <div className="text-sm text-red-600 mb-1 font-bold">Total Penalty Amount</div>
//                   <div className="font-black text-2xl text-red-600">{currencyFormatter.format(viewInspection.total_penalty || 0)}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Status</div>
//                   <div className="mt-1">
//                     <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass(viewInspection.status)}`}>
//                       {viewInspection.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {viewInspection.inspection_items && viewInspection.inspection_items.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center justify-between">
//                     <span>Inspection Checklist</span>
//                     <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                       {viewInspection.inspection_items.length} Items
//                     </span>
//                   </h3>
//                   <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
//                     <table className="w-full border-collapse">
//                       <thead>
//                         <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">#</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Item Name</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Category</th>
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Qty</th>
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Move-in</th>
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Move-out</th>
//                           <th className="px-4 py-3 text-right text-sm font-bold border-r border-blue-500">Penalty</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold">Damage Notes</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {viewInspection.inspection_items.map((item, idx) => (
//                           <tr key={idx} className={`border-b-2 border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
//                             <td className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-200">
//                               {idx + 1}
//                             </td>
//                             <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-200">
//                               {item.item_name}
//                             </td>
//                             <td className="px-4 py-3 text-gray-700 border-r border-gray-200">
//                               <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
//                                 {item.category}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-center font-bold text-gray-900 border-r border-gray-200">
//                               {item.quantity}
//                             </td>
//                             <td className="px-4 py-3 text-center border-r border-gray-200">
//                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(item.condition_at_movein)}`}>
//                                 {item.condition_at_movein}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-center border-r border-gray-200">
//                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConditionBadgeClass(item.condition_at_moveout)}`}>
//                                 {item.condition_at_moveout}
//                               </span>
//                             </td>
//                             <td className="px-4 py-3 text-right font-bold text-red-600 border-r border-gray-200">
//                               {currencyFormatter.format(item.penalty_amount || 0)}
//                             </td>
//                             <td className="px-4 py-3 text-sm text-gray-600">
//                               {item.notes || '-'}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {viewInspection.notes && (
//                 <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
//                   <h3 className="text-sm font-black text-amber-900 mb-2">Additional Notes</h3>
//                   <p className="text-sm text-amber-800">{viewInspection.notes}</p>
//                 </div>
//               )}

//               <div className="border-t-2 border-gray-300 pt-6 mt-8">
//                 <div className="grid md:grid-cols-3 gap-6">
//                   <div className="text-center">
//                     <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
//                     <div className="font-bold text-gray-900">{viewInspection.tenant_name}</div>
//                     <div className="text-sm text-gray-600">Tenant Signature</div>
//                     <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(viewInspection.inspection_date)}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
//                     <div className="font-bold text-gray-900">{viewInspection.inspector_name}</div>
//                     <div className="text-sm text-gray-600">Inspector/Manager Signature</div>
//                     <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(viewInspection.inspection_date)}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
//                     <div className="font-bold text-gray-900">Witness</div>
//                     <div className="text-sm text-gray-600">Witness Signature</div>
//                     <div className="text-xs text-gray-500 mt-1">Date: __________</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
//                 <div className="text-xs text-blue-900 font-semibold">
//                   This is an official move-out inspection document. By signing, both parties acknowledge the accuracy of the inspection results and penalty amounts.
//                 </div>
//                 <div className="text-xs text-blue-700 mt-2">
//                   Status: <span className={`font-bold ${viewInspection.status === 'Completed' ? 'text-green-700' : 'text-amber-700'}`}>
//                     {viewInspection.status}
//                   </span>
//                   {viewInspection.total_penalty > 0 && (
//                     <span className="ml-3">
//                       | Total Penalty: <span className="font-bold text-red-700">{currencyFormatter.format(viewInspection.total_penalty)}</span>
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showOTPModal && viewInspection && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowOTPModal(false)}>
//           <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
//             <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-black text-gray-900">Verify OTP</h2>
//               <button onClick={() => setShowOTPModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-6">
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                 <p className="text-sm text-blue-800 font-semibold">
//                   OTP has been sent to {viewInspection.tenant_phone}
//                 </p>
//                 <p className="text-xs text-blue-600 mt-1">Please enter the 6-digit code to verify this inspection</p>
//               </div>

//               <label className="block text-sm font-bold text-gray-700 mb-2">
//                 Enter OTP <span className="text-red-600">*</span>
//               </label>
//               <input
//                 type="text"
//                 maxLength={6}
//                 value={otpCode}
//                 onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
//                 placeholder="000000"
//                 className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-bold text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
//               />

//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={() => setShowOTPModal(false)}
//                   className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmitOTP}
//                   disabled={otpCode.length !== 6}
//                   className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Verify
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showStatusModal && selectedInspectionForStatus && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
//             <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">Update Status</h2>
//                   <p className="text-sm text-emerald-100 mt-1">Approve and change inspection status</p>
//                 </div>
//                 <button onClick={() => setShowStatusModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-5">
//               <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//                 <div className="grid grid-cols-2 gap-3 text-sm">
//                   <div>
//                     <span className="text-gray-600">Tenant:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.tenant_name}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Property:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.property_name}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Room:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedInspectionForStatus.room_number}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Inspection Date:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{dateFormatter(selectedInspectionForStatus.inspection_date)}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Total Penalty:</span>
//                     <p className="font-bold text-red-600 mt-0.5">{currencyFormatter.format(selectedInspectionForStatus.total_penalty)}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Current Status:</span>
//                     <p className="mt-0.5">
//                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedInspectionForStatus.status)}`}>
//                         {selectedInspectionForStatus.status}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   New Status <span className="text-red-600">*</span>
//                 </label>
//                 <select
//                   value={statusUpdateData.newStatus}
//                   onChange={(e) => setStatusUpdateData({ ...statusUpdateData, newStatus: e.target.value })}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Active">Active</option>
//                   <option value="Completed">Completed</option>
//                   <option value="Approved">Approved</option>
//                   <option value="Cancelled">Cancelled</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">
//                   Remarks / Notes
//                 </label>
//                 <textarea
//                   value={statusUpdateData.remarks}
//                   onChange={(e) => setStatusUpdateData({ ...statusUpdateData, remarks: e.target.value })}
//                   placeholder="Add any remarks or notes about this status update..."
//                   rows={4}
//                   className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-emerald-500 transition-colors resize-none"
//                 />
//                 <p className="text-xs text-gray-500 mt-1.5">
//                   This will be added to the inspection notes with timestamp.
//                 </p>
//               </div>

//               {statusUpdateData.newStatus !== selectedInspectionForStatus.status && (
//                 <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
//                   <div className="flex items-start gap-3">
//                     <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                       <span className="text-white text-xs font-bold">!</span>
//                     </div>
//                     <div>
//                       <div className="font-bold text-amber-900 text-sm">Status Change</div>
//                       <div className="text-sm text-amber-800 mt-1">
//                         Status will change from <span className="font-bold">{selectedInspectionForStatus.status}</span> to{' '}
//                         <span className="font-bold">{statusUpdateData.newStatus}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t">
//               <button
//                 onClick={() => setShowStatusModal(false)}
//                 className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleUpdateStatus}
//                 disabled={saving || !statusUpdateData.newStatus}
//                 className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <Check className="w-4 h-4" />
//                     Update Status
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




// import { useEffect, useState, useCallback, useMemo } from 'react';
// import {
//   FileText, Plus, Trash2, Loader2, X, Download,
//   Building, IndianRupee, StickyNote, RefreshCw, Filter,
//   AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
//   ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
//   ChevronRight, ChevronLeft, Boxes, Square, CheckSquare,
//   AlertCircle
// } from 'lucide-react';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog, DialogContent, DialogClose,
// } from "@/components/ui/dialog";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
// } from "@/components/ui/table";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import Swal from 'sweetalert2';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import {
//   getInspections,
//   getInspectionById,
//   createInspection,
//   updateInspection,
//   deleteInspection,
//   bulkDeleteInspections,
//   getInspectionStats,
//   getDefaultPenaltyRules
// } from "@/lib/moveOutInspectionApi";
// import { getHandovers } from "@/lib/handoverApi";

// // ─── Types ────────────────────────────────────────────────────────────────────
// interface InspectionItem {
//   id?: string;
//   inspection_id?: string;
//   handover_item_id: string;
//   item_name: string;
//   category: string;
//   quantity: number;
//   condition_at_movein: string;
//   condition_at_moveout: string;
//   penalty_amount: number;
//   notes?: string;
// }

// interface PenaltyRule {
//   id: string;
//   item_category: string;
//   from_condition: string;
//   to_condition: string;
//   penalty_amount: number;
//   description?: string;
// }

// interface MoveOutInspection {
//   id: string;
//   handover_id: string;
//   tenant_name: string;
//   tenant_phone: string;
//   tenant_email?: string;
//   property_id?: number;
//   property_name: string;
//   room_number: string;
//   bed_number?: string;
//   move_in_date?: string;
//   inspection_date: string;
//   inspector_name: string;
//   total_penalty: number;
//   notes?: string;
//   status: string;
//   penalty_rules?: PenaltyRule[];
//   inspection_items?: InspectionItem[];
//   created_at?: string;
// }

// interface HandoverOption {
//   id: string;
//   tenant_name: string;
//   tenant_phone: string;
//   property_name: string;
//   room_number: string;
//   bed_number?: string;
//   move_in_date: string;
//   status: string;
//   handover_items?: any[];
// }

// type StatusType = 'all' | 'Completed' | 'Approved' | 'Pending' | 'Active' | 'Cancelled';

// const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

// // ─── Style tokens ─────────────────────────────────────────────────────────────
// const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
// const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
// const SI = "text-[11px] py-0.5";

// const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
//   <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
//     {icon}{title}
//   </div>
// );

// const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
//   <Card className={`${bg} border-0 shadow-sm`}>
//     <CardContent className="p-2 sm:p-3">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
//           <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
//         </div>
//         <div className={`p-1.5 rounded-lg ${color}`}>
//           <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// const statusColor = (s: string) => {
//   switch (s) {
//     case 'Approved': return 'bg-emerald-100 text-emerald-700';
//     case 'Completed': return 'bg-green-100 text-green-700';
//     case 'Active': return 'bg-blue-100 text-blue-700';
//     case 'Pending': return 'bg-amber-100 text-amber-700';
//     case 'Cancelled': return 'bg-red-100 text-red-700';
//     default: return 'bg-gray-100 text-gray-700';
//   }
// };

// const conditionColor = (c: string) => {
//   switch (c) {
//     case 'New': return 'bg-green-100 text-green-700';
//     case 'Good': return 'bg-blue-100 text-blue-700';
//     case 'Used': return 'bg-yellow-100 text-yellow-700';
//     case 'Damaged': return 'bg-orange-100 text-orange-700';
//     case 'Missing': return 'bg-red-100 text-red-700';
//     default: return 'bg-gray-100 text-gray-700';
//   }
// };

// const fmt = (d: string | undefined | null) => {
//   if (!d) return 'N/A';
//   try {
//     const date = new Date(d);
//     if (isNaN(date.getTime())) return 'N/A';
//     return date.toLocaleDateString('en-IN');
//   } catch {
//     return 'N/A';
//   }
// };

// const toInputDate = (d: string | undefined | null): string => {
//   if (!d) return '';
//   try {
//     if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
//     const date = new Date(d);
//     if (isNaN(date.getTime())) return '';
//     return date.toISOString().split('T')[0];
//   } catch {
//     return '';
//   }
// };

// const safeNum = (v: any): number => {
//   const n = parseFloat(String(v));
//   return isNaN(n) ? 0 : n;
// };

// const money = (n: any) => `₹${safeNum(n).toLocaleString('en-IN')}`;
// const pdfMoney = (n: any) => `Rs. ${safeNum(n).toLocaleString('en-IN')}`;

// export function MoveOutInspection() {
//   const [inspections, setInspections] = useState<MoveOutInspection[]>([]);
//   const [handovers, setHandovers] = useState<HandoverOption[]>([]);
//   const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [editingItem, setEditingItem] = useState<MoveOutInspection | null>(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [viewItem, setViewItem] = useState<MoveOutInspection | null>(null);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [otpCode, setOtpCode] = useState('');
//   const [generatedOTP, setGeneratedOTP] = useState('');
//   const [selectedHandover, setSelectedHandover] = useState<HandoverOption | null>(null);
//   const [loadingHandovers, setLoadingHandovers] = useState(false);

//   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   const [stats, setStats] = useState({
//     total: 0, completed: 0, approved: 0, pending: 0, active: 0, cancelled: 0,
//     total_penalties: 0, avg_penalty: 0, max_penalty: 0, total_properties: 0
//   });

//   const [statusFilter, setStatusFilter] = useState<StatusType>('all');
//   const [propertyFilter, setPropertyFilter] = useState('all');
//   const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

//   const [colSearch, setColSearch] = useState({
//     tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
//   });

//   const emptyForm = {
//     handover_id: '',
//     inspection_date: new Date().toISOString().split('T')[0],
//     inspector_name: '',
//     total_penalty: 0,
//     notes: '',
//     status: 'Pending'
//   };
//   const [formData, setFormData] = useState(emptyForm);

//   const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

//   // ── Load data ────────────────────────────────────────────────────────────────
//   const loadAll = useCallback(async () => {
//     setLoading(true);
//     try {
//       const filters: any = {};
//       if (statusFilter !== 'all') filters.status = statusFilter;
//       if (propertyFilter !== 'all') filters.property_id = propertyFilter;

//       const res = await getInspections(filters);
//       const data: MoveOutInspection[] = (res.data || []).map(i => ({
//         ...i,
//         total_penalty: safeNum(i.total_penalty),
//       }));
//       setInspections(data);

//       const statsRes = await getInspectionStats();
//       setStats(statsRes.data);

//       // Extract unique properties for filter
//       const uniqueProps = Array.from(new Set(data.map(i => i.property_name)))
//         .map(name => ({ id: name, name }));
//       setProperties(uniqueProps);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to load inspections');
//     } finally {
//       setLoading(false);
//     }
//   }, [statusFilter, propertyFilter]);

//   const loadHandovers = useCallback(async () => {
//     try {
//       setLoadingHandovers(true);
//       const res = await getHandovers({ status: 'Active' });
//       const data = (res.data || []).map(h => ({
//         id: String(h.id),
//         tenant_name: h.tenant_name,
//         tenant_phone: h.tenant_phone,
//         property_name: h.property_name,
//         room_number: h.room_number,
//         bed_number: h.bed_number,
//         move_in_date: h.move_in_date,
//         status: h.status,
//         handover_items: h.handover_items || []
//       }));
//       setHandovers(data);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to load handovers');
//     } finally {
//       setLoadingHandovers(false);
//     }
//   }, []);

//   const loadPenaltyRules = useCallback(async () => {
//     try {
//       const res = await getDefaultPenaltyRules();
//       setPenaltyRules(res.data || []);
//     } catch (err: any) {
//       console.error('Failed to load penalty rules:', err);
//     }
//   }, []);

//   useEffect(() => {
//     loadAll();
//     loadHandovers();
//     loadPenaltyRules();
//   }, []);

//   useEffect(() => { loadAll(); }, [loadAll]);

//   // ── Handover selection ───────────────────────────────────────────────────────
//   const handleHandoverSelect = async (handoverId: string) => {
//     const handover = handovers.find(h => h.id === handoverId);
//     if (!handover) return;

//     setSelectedHandover(handover);
//     setFormData(p => ({
//       ...p,
//       handover_id: handoverId
//     }));

//     // Initialize inspection items from handover items
//     if (handover.handover_items && handover.handover_items.length > 0) {
//       const items: InspectionItem[] = handover.handover_items.map((item: any) => ({
//         handover_item_id: item.id || '',
//         item_name: item.item_name,
//         category: item.category,
//         quantity: item.quantity,
//         condition_at_movein: item.condition_at_movein,
//         condition_at_moveout: item.condition_at_movein, // Default to same as move-in
//         penalty_amount: 0,
//         notes: ''
//       }));
//       setInspectionItems(items);
//     } else {
//       setInspectionItems([]);
//     }
//   };

//   // ── Calculate penalty based on rules ─────────────────────────────────────────
//   const calculatePenalty = (
//     category: string,
//     fromCondition: string,
//     toCondition: string
//   ): number => {
//     if (fromCondition === toCondition) return 0;

//     const rule = penaltyRules.find(r =>
//       r.item_category === category &&
//       r.from_condition === fromCondition &&
//       r.to_condition === toCondition
//     );

//     return rule?.penalty_amount || 0;
//   };

//   // ── Update inspection item ───────────────────────────────────────────────────
//   const updateInspectionItem = (index: number, field: keyof InspectionItem, value: any) => {
//     const newItems = [...inspectionItems];
//     newItems[index] = { ...newItems[index], [field]: value };

//     if (field === 'condition_at_moveout') {
//       const item = newItems[index];
//       const penalty = calculatePenalty(
//         item.category,
//         item.condition_at_movein,
//         value
//       );
//       newItems[index].penalty_amount = penalty;
//     }

//     setInspectionItems(newItems);

//     // Update total penalty
//     const total = newItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
//     setFormData(p => ({ ...p, total_penalty: total }));
//   };

//   // ── Filtered rows ───────────────────────────────────────────────────────────
//   const filteredItems = useMemo(() => {
//     return inspections.filter(i => {
//       const cs = colSearch;
//       const tn = !cs.tenant_name || i.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
//       const pn = !cs.property_name || i.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
//       const rn = !cs.room_number || i.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
//       const ins = !cs.inspector_name || i.inspector_name?.toLowerCase().includes(cs.inspector_name.toLowerCase());
//       const s = !cs.status || i.status?.toLowerCase().includes(cs.status.toLowerCase());
//       const d = !cs.inspection_date || fmt(i.inspection_date).includes(cs.inspection_date);
//       return tn && pn && rn && ins && s && d;
//     });
//   }, [inspections, colSearch]);

//   // ── Bulk Selection ───────────────────────────────────────────────────────────
//   const toggleSelectAll = () => {
//     if (selectAll) {
//       setSelectedItems(new Set());
//     } else {
//       setSelectedItems(new Set(filteredItems.map(item => item.id)));
//     }
//     setSelectAll(!selectAll);
//   };

//   const toggleSelectItem = (id: string) => {
//     const newSelected = new Set(selectedItems);
//     if (newSelected.has(id)) newSelected.delete(id);
//     else newSelected.add(id);
//     setSelectedItems(newSelected);
//     setSelectAll(newSelected.size === filteredItems.length && filteredItems.length > 0);
//   };

//   // ── CRUD Operations ──────────────────────────────────────────────────────────
//   const openAdd = () => {
//     setEditingItem(null);
//     setSelectedHandover(null);
//     setFormData(emptyForm);
//     setInspectionItems([]);
//     setCurrentStep(1);
//     setShowForm(true);
//   };

//   const openEdit = async (i: MoveOutInspection) => {
//     try {
//       const fullInspection = await getInspectionById(i.id);
//       const data = fullInspection.data;

//       setEditingItem(data);
//       setSelectedHandover({
//         id: data.handover_id,
//         tenant_name: data.tenant_name,
//         tenant_phone: data.tenant_phone,
//         property_name: data.property_name,
//         room_number: data.room_number,
//         bed_number: data.bed_number,
//         move_in_date: data.move_in_date || '',
//         status: 'Active'
//       });

//       setFormData({
//         handover_id: data.handover_id,
//         inspection_date: toInputDate(data.inspection_date) || new Date().toISOString().split('T')[0],
//         inspector_name: data.inspector_name || '',
//         total_penalty: safeNum(data.total_penalty),
//         notes: data.notes || '',
//         status: data.status || 'Pending'
//       });

//       setInspectionItems(data.inspection_items || []);
//       setCurrentStep(2);
//       setShowForm(true);
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to load inspection details');
//     }
//   };

//   const handleSubmit = async () => {
//     if (!formData.handover_id) {
//       toast.error('Please select a handover');
//       return;
//     }
//     if (!formData.inspector_name) {
//       toast.error('Inspector name is required');
//       return;
//     }
//     if (currentStep === 1) {
//       if (inspectionItems.length === 0) {
//         toast.error('Selected handover has no items to inspect');
//         return;
//       }
//       setCurrentStep(2);
//       return;
//     }

//     // Validate all items have condition selected
//     for (let i = 0; i < inspectionItems.length; i++) {
//       if (!inspectionItems[i].condition_at_moveout) {
//         toast.error(`Please select condition for item: ${inspectionItems[i].item_name}`);
//         return;
//       }
//     }

//     setSubmitting(true);
//     try {
//       const payload = {
//         ...formData,
//         total_penalty: safeNum(formData.total_penalty),
//         inspection_items: inspectionItems,
//         status: formData.status || 'Completed'
//       };

//       if (editingItem) {
//         await updateInspection(editingItem.id, payload);
//         toast.success('Inspection updated successfully');
//       } else {
//         await createInspection(payload);
//         toast.success('Inspection created successfully');
//       }

//       setShowForm(false);
//       await loadAll();
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to save inspection');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id: string, name?: string) => {
//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: `Delete inspection for "${name || id}"? This cannot be undone!`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//       cancelButtonText: 'Cancel',
//       background: '#fff',
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: '400px',
//       padding: '1.5rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-lg font-bold text-gray-800',
//         htmlContainer: 'text-sm text-gray-600 my-2',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//         cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//         actions: 'flex justify-center gap-2 mt-4'
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await deleteInspection(id);
//       await loadAll();
//       Swal.fire({
//         title: 'Deleted!',
//         text: 'Inspection record deleted successfully.',
//         icon: 'success',
//         timer: 1500,
//         showConfirmButton: false,
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-green-600',
//           htmlContainer: 'text-xs text-gray-600'
//         }
//       });
//     } catch (err: any) {
//       Swal.fire({
//         title: 'Error!',
//         text: err.message || 'Failed to delete inspection',
//         icon: 'error',
//         confirmButtonColor: '#3085d6',
//         confirmButtonText: 'OK',
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-red-600',
//           htmlContainer: 'text-xs text-gray-600',
//           confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//         },
//         buttonsStyling: false
//       });
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedItems.size === 0) {
//       Swal.fire({
//         title: 'No items selected',
//         text: 'Please select at least one record to delete.',
//         icon: 'info',
//         confirmButtonText: 'OK',
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-blue-600',
//           htmlContainer: 'text-xs text-gray-600',
//           confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//         },
//         buttonsStyling: false
//       });
//       return;
//     }

//     const result = await Swal.fire({
//       title: 'Are you sure?',
//       text: `Delete ${selectedItems.size} selected inspection record(s)? This cannot be undone!`,
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete them!',
//       cancelButtonText: 'Cancel',
//       background: '#fff',
//       backdrop: `rgba(0,0,0,0.4)`,
//       width: '400px',
//       padding: '1.5rem',
//       customClass: {
//         popup: 'rounded-xl shadow-2xl',
//         title: 'text-lg font-bold text-gray-800',
//         htmlContainer: 'text-sm text-gray-600 my-2',
//         confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
//         cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
//         actions: 'flex justify-center gap-2 mt-4'
//       },
//       buttonsStyling: false,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await bulkDeleteInspections(Array.from(selectedItems));
//       await loadAll();
//       setSelectedItems(new Set());
//       setSelectAll(false);
//       Swal.fire({
//         title: 'Deleted!',
//         text: `${selectedItems.size} record(s) deleted successfully.`,
//         icon: 'success',
//         timer: 1500,
//         showConfirmButton: false,
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-green-600',
//           htmlContainer: 'text-xs text-gray-600'
//         }
//       });
//     } catch (err: any) {
//       Swal.fire({
//         title: 'Error!',
//         text: err.message || 'Failed to delete records',
//         icon: 'error',
//         confirmButtonText: 'OK',
//         width: '350px',
//         padding: '1rem',
//         customClass: {
//           popup: 'rounded-xl shadow-2xl',
//           title: 'text-base font-bold text-red-600',
//           htmlContainer: 'text-xs text-gray-600',
//           confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
//         },
//         buttonsStyling: false
//       });
//     }
//   };

//   // ── Export CSV ───────────────────────────────────────────────────────────────
//   const handleExport = () => {
//     const headers = ['Tenant', 'Phone', 'Property', 'Room', 'Inspector', 'Inspection Date', 'Total Penalty', 'Items', 'Status'];
//     const rows = filteredItems.map(i => [
//       i.tenant_name,
//       i.tenant_phone,
//       i.property_name,
//       `${i.room_number}${i.bed_number ? `/${i.bed_number}` : ''}`,
//       i.inspector_name,
//       fmt(i.inspection_date),
//       money(i.total_penalty),
//       i.inspection_items?.length || 0,
//       i.status,
//     ]);
//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
//     a.download = `moveout_inspections_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//   };

//   // ── PDF Generation ───────────────────────────────────────────────────────────
//   const handleDownloadPDF = () => {
//     if (!viewItem) return;

//     try {
//       const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const margin = 15;
//       let yPos = margin;

//       const docId = String(viewItem.id).substring(0, 8).toUpperCase();

//       doc.setFontSize(20);
//       doc.setFont('helvetica', 'bold');
//       doc.text('MOVE-OUT INSPECTION REPORT', pageWidth / 2, yPos, { align: 'center' });
//       yPos += 10;

//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Document ID: ${docId}`, pageWidth / 2, yPos, { align: 'center' });
//       yPos += 10;

//       doc.line(margin, yPos, pageWidth - margin, yPos);
//       yPos += 8;

//       // Tenant Info
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Tenant Information', margin, yPos);
//       yPos += 6;

//       const tenantInfo = [
//         ['Tenant Name:', viewItem.tenant_name],
//         ['Phone:', viewItem.tenant_phone],
//         ['Email:', viewItem.tenant_email || 'N/A'],
//         ['Property:', viewItem.property_name],
//         ['Room:', `${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}`],
//         ['Move-in Date:', fmt(viewItem.move_in_date)],
//       ];

//       doc.setFontSize(10);
//       tenantInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(label, margin, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(String(value), margin + 40, yPos);
//         yPos += 6;
//       });
//       yPos += 4;

//       // Inspection Details
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Inspection Details', margin, yPos);
//       yPos += 6;

//       const inspectionInfo = [
//         ['Inspection Date:', fmt(viewItem.inspection_date)],
//         ['Inspector:', viewItem.inspector_name],
//         ['Total Penalty:', pdfMoney(viewItem.total_penalty)],
//         ['Status:', viewItem.status],
//       ];

//       doc.setFontSize(10);
//       inspectionInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(label, margin, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(String(value), margin + 40, yPos);
//         yPos += 6;
//       });

//       // Items Table
//       if (viewItem.inspection_items && viewItem.inspection_items.length > 0) {
//         yPos += 4;
//         if (yPos > 250) { doc.addPage(); yPos = margin; }

//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text(`Inspection Checklist (${viewItem.inspection_items.length} Items)`, margin, yPos);
//         yPos += 8;

//         const tableData = viewItem.inspection_items.map((item, idx) => [
//           (idx + 1).toString(),
//           item.item_name,
//           item.category,
//           item.quantity.toString(),
//           item.condition_at_movein,
//           item.condition_at_moveout,
//           pdfMoney(item.penalty_amount),
//           item.notes || '-',
//         ]);

//         autoTable(doc, {
//           startY: yPos,
//           head: [['#', 'Item Name', 'Category', 'Qty', 'Move-in', 'Move-out', 'Penalty', 'Notes']],
//           body: tableData,
//           theme: 'grid',
//           headStyles: { fillColor: [37, 99, 235], textColor: 255 },
//           margin: { left: margin, right: margin },
//           columnStyles: {
//             0: { cellWidth: 8 },
//             6: { cellWidth: 25 },
//           }
//         });

//         yPos = (doc as any).lastAutoTable.finalY + 10;
//       }

//       // Notes
//       if (viewItem.notes) {
//         if (yPos > 250) { doc.addPage(); yPos = margin; }
//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Additional Notes:', margin, yPos);
//         yPos += 6;
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         const notesLines = doc.splitTextToSize(viewItem.notes, pageWidth - 2 * margin);
//         doc.text(notesLines, margin, yPos);
//         yPos += notesLines.length * 5 + 10;
//       }

//       // Signatures
//       if (yPos > 250) { doc.addPage(); yPos = margin; }
//       yPos += 10;
//       doc.line(margin, yPos, pageWidth - margin, yPos);
//       yPos += 10;

//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Signatures', margin, yPos);
//       yPos += 10;

//       const signatureWidth = (pageWidth - 2 * margin - 20) / 3;
//       const signatures = [
//         { name: viewItem.tenant_name, label: 'Tenant Signature', date: fmt(viewItem.inspection_date) },
//         { name: viewItem.inspector_name, label: 'Inspector/Manager', date: fmt(viewItem.inspection_date) },
//         { name: 'Witness', label: 'Witness Signature', date: '__________' },
//       ];

//       signatures.forEach((sig, idx) => {
//         const xPos = margin + idx * (signatureWidth + 10);
//         doc.line(xPos, yPos + 15, xPos + signatureWidth, yPos + 15);
//         doc.setFontSize(9);
//         doc.setFont('helvetica', 'bold');
//         doc.text(sig.name, xPos + signatureWidth / 2, yPos + 20, { align: 'center' });
//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(8);
//         doc.text(sig.label, xPos + signatureWidth / 2, yPos + 25, { align: 'center' });
//         doc.text(`Date: ${sig.date}`, xPos + signatureWidth / 2, yPos + 30, { align: 'center' });
//       });

//       const fileName = `MoveOut_Inspection_${viewItem.tenant_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
//       doc.save(fileName);
//       toast.success('PDF downloaded successfully');
//     } catch (err: any) {
//       console.error('PDF generation error:', err);
//       toast.error('Failed to generate PDF: ' + err.message);
//     }
//   };

//   // ── Share WhatsApp ───────────────────────────────────────────────────────────
//   const handleShareWhatsApp = () => {
//     if (!viewItem) return;

//     try {
//       const phoneNumber = viewItem.tenant_phone.replace(/\D/g, '');
//       if (!phoneNumber) { toast.error('Phone number is missing'); return; }

//       const message = encodeURIComponent(
//         `📋 *MOVE-OUT INSPECTION REPORT*\n\n` +
//         `*Tenant:* ${viewItem.tenant_name}\n` +
//         `*Phone:* ${viewItem.tenant_phone}\n` +
//         `*Property:* ${viewItem.property_name}\n` +
//         `*Room:* ${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}\n` +
//         `*Inspection Date:* ${fmt(viewItem.inspection_date)}\n` +
//         `*Inspector:* ${viewItem.inspector_name}\n` +
//         `*Total Penalty:* ${money(viewItem.total_penalty)}\n` +
//         `*Items Inspected:* ${viewItem.inspection_items?.length || 0}\n` +
//         `*Status:* ${viewItem.status}`
//       );
//       window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
//     } catch (err) {
//       toast.error('Failed to share via WhatsApp');
//     }
//   };

//   const handlePrint = () => window.print();

//   // ── OTP Verification ─────────────────────────────────────────────────────────
//   const handleInitiateOTP = () => {
//     if (!viewItem) return;
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     setGeneratedOTP(otp);
//     setOtpCode('');
//     setShowOTPModal(true);
//     toast.info(`OTP: ${otp} (demo mode)`);
//   };

//   const handleVerifyOTP = async () => {
//     if (otpCode !== generatedOTP) { toast.error('Invalid OTP'); return; }

//     try {
//       if (viewItem) {
//         await updateInspection(viewItem.id, { ...viewItem, status: 'Approved' });
//         await loadAll();
//         toast.success('Inspection approved via OTP!');
//         setShowOTPModal(false);
//         setViewItem(null);
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Failed to update status');
//     }
//   };

//   const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all';
//   const hasColSearch = Object.values(colSearch).some(v => v !== '');
//   const activeCount = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
//   const clearFilters = () => { setStatusFilter('all'); setPropertyFilter('all'); };
//   const clearColSearch = () => setColSearch({
//     tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
//   });

//   return (
//     <div className="bg-gray-50 min-h-screen">

//       {/* ── HEADER ────────────────────────────────────────────────────────── */}
//       <div className="sticky top-0 z-20">
//         <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
//           <div className="flex items-end justify-end gap-1.5 flex-shrink-0">

//             <button onClick={() => setSidebarOpen(o => !o)}
//               className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
//                 ${sidebarOpen || hasFilters ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
//               <Filter className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden sm:inline">Filters</span>
//               {activeCount > 0 && (
//                 <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
//                   ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
//                   {activeCount}
//                 </span>
//               )}
//             </button>

//             <button onClick={handleExport}
//               className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
//               <Download className="h-3.5 w-3.5" />
//               <span className="hidden sm:inline">Export</span>
//             </button>

//             <button onClick={loadAll} disabled={loading}
//               className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
//               <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
//             </button>

//             <button onClick={openAdd}
//               className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
//               <Plus className="h-3.5 w-3.5 flex-shrink-0" />
//               <span className="hidden xs:inline">New Inspection</span>
//             </button>
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="px-3 sm:px-5 pb-3">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
//             <StatCard title="Total Inspections" value={stats.total}
//               icon={FileText} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
//             <StatCard title="Total Penalties" value={money(stats.total_penalties)}
//               icon={IndianRupee} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
//             <StatCard title="Avg Penalty" value={money(stats.avg_penalty)}
//               icon={AlertTriangle} color="bg-amber-600" bg="bg-gradient-to-br from-amber-50 to-amber-100" />
//             <StatCard title="Properties" value={stats.total_properties}
//               icon={Building} color="bg-green-600" bg="bg-gradient-to-br from-green-50 to-green-100" />
//           </div>
//           <div className="grid grid-cols-5 gap-1.5 mt-1.5">
//             <StatCard title="Completed" value={stats.completed} icon={Check} color="bg-green-600" bg="bg-green-50" />
//             <StatCard title="Approved" value={stats.approved} icon={ShieldCheck} color="bg-emerald-600" bg="bg-emerald-50" />
//             <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="bg-amber-600" bg="bg-amber-50" />
//             <StatCard title="Active" value={stats.active} icon={Boxes} color="bg-blue-600" bg="bg-blue-50" />
//             <StatCard title="Cancelled" value={stats.cancelled} icon={X} color="bg-red-600" bg="bg-red-50" />
//           </div>
//         </div>
//       </div>

//       {/* ── BODY ─────────────────────────────────────────────────────────── */}
//       <div className="relative">
//         <main className="p-3 sm:p-4">
//           <Card className="border rounded-lg shadow-sm">
//             <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
//               <span className="text-sm font-semibold text-gray-700">
//                 All Inspections ({filteredItems.length})
//                 {selectedItems.size > 0 && (
//                   <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
//                 )}
//               </span>
//               <div className="flex items-center gap-2">
//                 {selectedItems.size > 0 && (
//                   <Button size="sm" variant="destructive"
//                     className="h-7 text-[10px] px-2 bg-red-600 hover:bg-red-700"
//                     onClick={handleBulkDelete}>
//                     <Trash2 className="h-3 w-3 mr-1" />
//                     Delete Selected ({selectedItems.size})
//                   </Button>
//                 )}
//                 {hasColSearch && (
//                   <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
//                     Clear Search
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="overflow-auto max-h-[calc(100vh-310px)]">
//               <div className="min-w-[1200px]">
//                 <Table>
//                   <TableHeader className="sticky top-0 z-10 bg-gray-50">
//                     <TableRow>
//                       <TableHead className="py-2 px-3 text-xs w-8">
//                         <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
//                           {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
//                         </button>
//                       </TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Property</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Room/Bed</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Inspector</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Inspection Date</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Total Penalty</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Items</TableHead>
//                       <TableHead className="py-2 px-3 text-xs">Status</TableHead>
//                       <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
//                     </TableRow>

//                     <TableRow className="bg-gray-50/80">
//                       <TableCell className="py-1 px-2" />
//                       {[
//                         { key: 'tenant_name', ph: 'Search tenant…' },
//                         { key: null, ph: '' },
//                         { key: 'property_name', ph: 'Search prop…' },
//                         { key: 'room_number', ph: 'Room…' },
//                         { key: 'inspector_name', ph: 'Inspector…' },
//                         { key: 'inspection_date', ph: 'Date…' },
//                         { key: null, ph: '' },
//                         { key: null, ph: '' },
//                         { key: 'status', ph: 'Status…' },
//                       ].map((col, idx) => (
//                         <TableCell key={idx} className="py-1 px-2">
//                           {col.key ? (
//                             <Input placeholder={col.ph}
//                               value={colSearch[col.key as keyof typeof colSearch]}
//                               onChange={e => setColSearch(p => ({ ...p, [col.key!]: e.target.value }))}
//                               className="h-6 text-[10px]"
//                             />
//                           ) : <div />}
//                         </TableCell>
//                       ))}
//                       <TableCell className="py-1 px-2" />
//                     </TableRow>
//                   </TableHeader>

//                   <TableBody>
//                     {loading ? (
//                       <TableRow>
//                         <TableCell colSpan={12} className="text-center py-12">
//                           <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
//                           <p className="text-xs text-gray-500">Loading inspections…</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredItems.length === 0 ? (
//                       <TableRow>
//                         <TableCell colSpan={12} className="text-center py-12">
//                           <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
//                           <p className="text-sm font-medium text-gray-500">No inspections found</p>
//                           <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
//                         </TableCell>
//                       </TableRow>
//                     ) : filteredItems.map(i => (
//                       <TableRow key={i.id} className="hover:bg-gray-50">
//                         <TableCell className="py-2 px-3">
//                           <button onClick={() => toggleSelectItem(i.id)} className="p-1 hover:bg-gray-200 rounded">
//                             {selectedItems.has(i.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
//                           </button>
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-medium">{i.tenant_name}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600">{i.tenant_phone}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[140px] truncate">{i.property_name}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600">
//                           {i.room_number}{i.bed_number ? ` / ${i.bed_number}` : ''}
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600">{i.inspector_name}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(i.inspection_date)}</TableCell>
//                         <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">
//                           <span className={i.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
//                             {money(i.total_penalty)}
//                           </span>
//                         </TableCell>
//                         <TableCell className="py-2 px-3 text-xs">
//                           <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
//                             {i.inspection_items?.length || 0} items
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           <Badge className={`text-[9px] px-1.5 ${statusColor(i.status)}`}>{i.status}</Badge>
//                         </TableCell>
//                         <TableCell className="py-2 px-3">
//                           <div className="flex justify-end gap-1">
//                             <Button size="sm" variant="ghost"
//                               className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
//                               onClick={() => setViewItem(i)} title="View">
//                               <Eye className="h-3.5 w-3.5" />
//                             </Button>
//                             <Button size="sm" variant="ghost"
//                               className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
//                               onClick={() => openEdit(i)} title="Edit">
//                               <FileText className="h-3.5 w-3.5" />
//                             </Button>
//                             <Button size="sm" variant="ghost"
//                               className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
//                               onClick={() => handleDelete(i.id, i.tenant_name)} title="Delete">
//                               <Trash2 className="h-3.5 w-3.5" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </div>
//           </Card>
//         </main>

//         {/* ── FILTER DRAWER ────────────────────────────────────────────── */}
//         {sidebarOpen && (
//           <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
//         )}
//         <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
//           transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
//           <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
//             <div className="flex items-center gap-2">
//               <Filter className="h-4 w-4 text-white" />
//               <span className="text-sm font-semibold text-white">Filters</span>
//               {hasFilters && (
//                 <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
//                   {activeCount} active
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               {hasFilters && (
//                 <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
//                   Clear all
//                 </button>
//               )}
//               <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-5">
//             <div>
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
//                 <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
//               </p>
//               <div className="space-y-1">
//                 {(['all', 'Completed', 'Approved', 'Pending', 'Active', 'Cancelled'] as StatusType[]).map(s => (
//                   <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
//                     ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                     <input type="radio" name="status" value={s} checked={statusFilter === s}
//                       onChange={() => setStatusFilter(s)} className="sr-only" />
//                     <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                     <span className="text-[12px] font-medium">{s === 'all' ? 'All Statuses' : s}</span>
//                     {statusFilter === s && (
//                       <span className="ml-auto">
//                         <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                         </svg>
//                       </span>
//                     )}
//                   </label>
//                 ))}
//               </div>
//             </div>
//             <div className="border-t border-gray-100" />
//             <div>
//               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
//                 <Building className="h-3 w-3 text-indigo-500" /> Property
//               </p>
//               <div className="space-y-1">
//                 <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
//                   ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                   <input type="radio" name="prop" value="all" checked={propertyFilter === 'all'}
//                     onChange={() => setPropertyFilter('all')} className="sr-only" />
//                   <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                   <span className="text-[12px] font-medium">All Properties</span>
//                   {propertyFilter === 'all' && (
//                     <span className="ml-auto">
//                       <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                       </svg>
//                     </span>
//                   )}
//                 </label>
//                 {properties.map(p => (
//                   <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
//                     ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
//                     <input type="radio" name="prop" value={p.id} checked={propertyFilter === p.id}
//                       onChange={() => setPropertyFilter(p.id)} className="sr-only" />
//                     <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
//                     <span className="text-[12px] font-medium truncate">{p.name}</span>
//                     {propertyFilter === p.id && (
//                       <span className="ml-auto flex-shrink-0">
//                         <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//                         </svg>
//                       </span>
//                     )}
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
//             <button onClick={clearFilters} disabled={!hasFilters}
//               className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
//               Clear All
//             </button>
//             <button onClick={() => setSidebarOpen(false)}
//               className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">
//               Apply & Close
//             </button>
//           </div>
//         </aside>
//       </div>

//       {/* ══ ADD / EDIT DIALOG ════════════════════════════════════════════════ */}
//       <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
//         <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//           <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//             <div>
//               <h2 className="text-base font-semibold">{editingItem ? 'Edit Inspection' : 'New Move-Out Inspection'}</h2>
//               <p className="text-xs text-blue-100">
//                 Step {currentStep} of 2 — {currentStep === 1 ? 'Select Handover' : 'Inspect Items'}
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-1.5">
//                 <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
//                   ${currentStep === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
//                   {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
//                 </span>
//                 <div className="h-0.5 w-4 bg-blue-400" />
//                 <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
//                   ${currentStep === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>2</span>
//               </div>
//               <DialogClose asChild>
//                 <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
//               </DialogClose>
//             </div>
//           </div>

//           <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

//             {/* ── STEP 1 ── */}
//             {currentStep === 1 && (
//               <>
//                 <div>
//                   <SH icon={<User className="h-3 w-3" />} title="Select Tenant Handover" />
//                   <div>
//                     <label className={L}>Handover <span className="text-red-400">*</span></label>
//                     {loadingHandovers ? (
//                       <div className="flex items-center justify-center py-4">
//                         <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
//                       </div>
//                     ) : (
//                       <Select value={formData.handover_id} onValueChange={handleHandoverSelect}>
//                         <SelectTrigger className={F}>
//                           <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
//                           <SelectValue placeholder="Select active handover" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {handovers.map(h => (
//                             <SelectItem key={h.id} value={String(h.id)} className={SI}>
//                               {h.tenant_name} — {h.property_name} Room {h.room_number}
//                               {h.bed_number ? `/${h.bed_number}` : ''}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   </div>
//                 </div>

//                 {selectedHandover && (
//                   <div className="bg-blue-50 rounded-lg p-3">
//                     <SH icon={<Building className="h-3 w-3" />} title="Handover Details" color="text-blue-700" />
//                     <div className="grid grid-cols-2 gap-2 text-[11px]">
//                       <div><span className="font-semibold">Tenant:</span> {selectedHandover.tenant_name}</div>
//                       <div><span className="font-semibold">Phone:</span> {selectedHandover.tenant_phone}</div>
//                       <div><span className="font-semibold">Property:</span> {selectedHandover.property_name}</div>
//                       <div><span className="font-semibold">Room:</span> {selectedHandover.room_number}{selectedHandover.bed_number ? `/${selectedHandover.bed_number}` : ''}</div>
//                       <div><span className="font-semibold">Move-in:</span> {fmt(selectedHandover.move_in_date)}</div>
//                       <div><span className="font-semibold">Items:</span> {selectedHandover.handover_items?.length || 0}</div>
//                     </div>
//                   </div>
//                 )}

//                 <div>
//                   <SH icon={<Calendar className="h-3 w-3" />} title="Inspection Details" color="text-green-600" />
//                   <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
//                     <div>
//                       <label className={L}>Inspector Name <span className="text-red-400">*</span></label>
//                       <Input className={F} placeholder="Inspector name"
//                         value={formData.inspector_name}
//                         onChange={e => setFormData(p => ({ ...p, inspector_name: e.target.value }))} />
//                     </div>
//                     <div>
//                       <label className={L}>Inspection Date <span className="text-red-400">*</span></label>
//                       <Input type="date" className={F}
//                         value={formData.inspection_date}
//                         onChange={e => setFormData(p => ({ ...p, inspection_date: e.target.value }))} />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
//                   <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
//                     rows={2} placeholder="Additional notes…"
//                     value={formData.notes}
//                     onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
//                 </div>

//                 {inspectionItems.length > 0 && (
//                   <div className="bg-green-50 rounded-lg p-2 text-[11px] text-green-700 flex items-center gap-2">
//                     <Check className="h-3.5 w-3.5" />
//                     {inspectionItems.length} items loaded for inspection
//                   </div>
//                 )}
//               </>
//             )}

//             {/* ── STEP 2: Item Inspection ── */}
//             {currentStep === 2 && (
//               <div>
//                 <SH icon={<FileText className="h-3 w-3" />} title="Item Inspection Checklist" />
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3 text-[11px] text-amber-700">
//                   <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
//                   Select move-out condition for each item. Penalties auto-calculated.
//                 </div>

//                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
//                   {inspectionItems.map((item, idx) => (
//                     <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
//                       <div className="flex items-center justify-between mb-2">
//                         <span className="text-[10px] font-bold text-gray-500 uppercase">Item {idx + 1}</span>
//                         {item.penalty_amount > 0 && (
//                           <Badge className="bg-red-100 text-red-700 text-[9px]">
//                             Penalty: {money(item.penalty_amount)}
//                           </Badge>
//                         )}
//                       </div>

//                       <div className="text-[11px] font-medium mb-2">{item.item_name}</div>
//                       <div className="grid grid-cols-2 gap-2 mb-2 text-[10px] text-gray-600">
//                         <div>Category: <span className="font-semibold">{item.category}</span></div>
//                         <div>Qty: <span className="font-semibold">{item.quantity}</span></div>
//                         <div>Move-in: <Badge className={`text-[8px] px-1 ${conditionColor(item.condition_at_movein)}`}>
//                           {item.condition_at_movein}
//                         </Badge></div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-2">
//                         <div>
//                           <label className={L}>Move-out Condition</label>
//                           <Select
//                             value={item.condition_at_moveout}
//                             onValueChange={v => updateInspectionItem(idx, 'condition_at_moveout', v)}>
//                             <SelectTrigger className="h-7 text-[10px]">
//                               <SelectValue placeholder="Select condition" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               {CONDITIONS.map(c => (
//                                 <SelectItem key={c} value={c} className="text-[10px]">{c}</SelectItem>
//                               ))}
//                             </SelectContent>
//                           </Select>
//                         </div>
//                         <div>
//                           <label className={L}>Penalty (Override)</label>
//                           <Input type="number" min={0} className="h-7 text-[10px]"
//                             value={item.penalty_amount}
//                             onChange={e => updateInspectionItem(idx, 'penalty_amount', parseFloat(e.target.value) || 0)} />
//                         </div>
//                       </div>

//                       <div className="mt-2">
//                         <label className={L}>Notes</label>
//                         <Input className="h-7 text-[10px]" placeholder="Damage description..."
//                           value={item.notes || ''}
//                           onChange={e => updateInspectionItem(idx, 'notes', e.target.value)} />
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-3 bg-blue-50 rounded-lg p-2 flex justify-between items-center">
//                   <span className="text-[11px] font-semibold text-blue-700">Total Penalty:</span>
//                   <span className="text-[12px] font-bold text-blue-800">{money(formData.total_penalty)}</span>
//                 </div>

//                 <div>
//                   <SH icon={<StickyNote className="h-3 w-3" />} title="Status" color="text-purple-600" />
//                   <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
//                     <SelectTrigger className={F}>
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="Completed">Completed</SelectItem>
//                       <SelectItem value="Approved">Approved</SelectItem>
//                       <SelectItem value="Pending">Pending</SelectItem>
//                       <SelectItem value="Active">Active</SelectItem>
//                       <SelectItem value="Cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             )}

//             {/* Navigation */}
//             <div className="flex gap-2 pt-1">
//               {currentStep === 2 && (
//                 <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}
//                   className="h-8 text-[11px] px-4 flex items-center gap-1.5">
//                   <ChevronLeft className="h-3.5 w-3.5" /> Back
//                 </Button>
//               )}
//               <Button disabled={submitting} onClick={handleSubmit}
//                 className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
//                 {submitting ? (
//                   <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
//                 ) : currentStep === 1 ? (
//                   <>Next <ChevronRight className="h-3.5 w-3.5" /></>
//                 ) : editingItem ? (
//                   <><Check className="h-3.5 w-3.5" /> Update Inspection</>
//                 ) : (
//                   <><Check className="h-3.5 w-3.5" /> Complete Inspection</>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ══ VIEW DIALOG ══════════════════════════════════════════════════════ */}
//       {viewItem && (
//         <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
//           <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
//             <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
//               <div>
//                 <h2 className="text-base font-semibold">Move-Out Inspection Report</h2>
//                 <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button onClick={handleDownloadPDF} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Download PDF">
//                   <FileDown className="h-4 w-4" />
//                 </button>
//                 <button onClick={handleShareWhatsApp} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Share on WhatsApp">
//                   <MessageCircle className="h-4 w-4" />
//                 </button>
//                 <button onClick={handlePrint} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Print">
//                   <Printer className="h-4 w-4" />
//                 </button>
//                 {viewItem.status !== 'Approved' && (
//                   <button onClick={handleInitiateOTP} className="p-1.5 rounded-full hover:bg-white/20 transition-colors" title="Verify with OTP">
//                     <ShieldCheck className="h-4 w-4" />
//                   </button>
//                 )}
//                 <DialogClose asChild>
//                   <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
//                 </DialogClose>
//               </div>
//             </div>

//             <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                 {[
//                   ['Tenant', viewItem.tenant_name],
//                   ['Phone', viewItem.tenant_phone],
//                   ['Email', viewItem.tenant_email || 'N/A'],
//                   ['Property', viewItem.property_name],
//                   ['Room/Bed', `${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}`],
//                   ['Move-in', fmt(viewItem.move_in_date)],
//                   ['Inspection Date', fmt(viewItem.inspection_date)],
//                   ['Inspector', viewItem.inspector_name],
//                   ['Total Penalty', money(viewItem.total_penalty)],
//                   ['Status', viewItem.status],
//                 ].map(([label, value]) => (
//                   <div key={label} className="bg-gray-50 rounded-lg p-2.5">
//                     <p className="text-[10px] text-gray-500 font-medium">{label}</p>
//                     <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
//                   </div>
//                 ))}
//               </div>

//               {viewItem.inspection_items && viewItem.inspection_items.length > 0 && (
//                 <div>
//                   <p className="text-[11px] font-bold text-gray-700 mb-2">
//                     Inspection Checklist ({viewItem.inspection_items.length} items)
//                   </p>
//                   <div className="border rounded-lg overflow-hidden">
//                     <table className="w-full text-[11px]">
//                       <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
//                         <tr>
//                           <th className="px-3 py-2 text-left font-semibold">#</th>
//                           <th className="px-3 py-2 text-left font-semibold">Item</th>
//                           <th className="px-3 py-2 text-left font-semibold">Category</th>
//                           <th className="px-3 py-2 text-center font-semibold">Qty</th>
//                           <th className="px-3 py-2 text-center font-semibold">Move-in</th>
//                           <th className="px-3 py-2 text-center font-semibold">Move-out</th>
//                           <th className="px-3 py-2 text-right font-semibold">Penalty</th>
//                           <th className="px-3 py-2 text-left font-semibold">Notes</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {viewItem.inspection_items.map((item, i) => (
//                           <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                             <td className="px-3 py-2 font-bold text-gray-500">{i + 1}</td>
//                             <td className="px-3 py-2 font-medium text-gray-800">{item.item_name}</td>
//                             <td className="px-3 py-2 text-gray-600">{item.category}</td>
//                             <td className="px-3 py-2 text-center font-semibold">{item.quantity}</td>
//                             <td className="px-3 py-2 text-center">
//                               <Badge className={`text-[9px] px-1.5 ${conditionColor(item.condition_at_movein)}`}>
//                                 {item.condition_at_movein}
//                               </Badge>
//                             </td>
//                             <td className="px-3 py-2 text-center">
//                               <Badge className={`text-[9px] px-1.5 ${conditionColor(item.condition_at_moveout)}`}>
//                                 {item.condition_at_moveout}
//                               </Badge>
//                             </td>
//                             <td className="px-3 py-2 text-right font-semibold text-red-600">
//                               {money(item.penalty_amount)}
//                             </td>
//                             <td className="px-3 py-2 text-gray-500">{item.notes || '-'}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                       <tfoot className="bg-gray-100 font-bold">
//                         <tr>
//                           <td colSpan={6} className="px-3 py-2 text-right">Total Penalty:</td>
//                           <td className="px-3 py-2 text-right text-red-600">{money(viewItem.total_penalty)}</td>
//                           <td></td>
//                         </tr>
//                       </tfoot>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {viewItem.notes && (
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
//                   <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
//                   <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
//                 </div>
//               )}

//               <div className="border-t pt-4 mt-4">
//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="text-center">
//                     <div className="border-b border-gray-400 mb-2 pb-8"></div>
//                     <p className="text-xs font-bold text-gray-800">{viewItem.tenant_name}</p>
//                     <p className="text-[9px] text-gray-500">Tenant Signature</p>
//                     <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
//                   </div>
//                   <div className="text-center">
//                     <div className="border-b border-gray-400 mb-2 pb-8"></div>
//                     <p className="text-xs font-bold text-gray-800">{viewItem.inspector_name}</p>
//                     <p className="text-[9px] text-gray-500">Inspector/Manager</p>
//                     <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
//                   </div>
//                   <div className="text-center">
//                     <div className="border-b border-gray-400 mb-2 pb-8"></div>
//                     <p className="text-xs font-bold text-gray-800">Witness</p>
//                     <p className="text-[9px] text-gray-500">Witness Signature</p>
//                     <p className="text-[8px] text-gray-400 mt-1">Date: __________</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
//                 <p className="text-[8px] text-blue-800">
//                   This is an official move-out inspection document. By signing, both parties acknowledge the accuracy of the inspection results.
//                 </p>
//                 <p className="text-[8px] text-blue-700 mt-1 font-semibold">Status: {viewItem.status}</p>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* ══ OTP Modal ════════════════════════════════════════════════════════ */}
//       {showOTPModal && viewItem && (
//         <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
//           <DialogContent className="max-w-md">
//             <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg -mt-4 -mx-4 mb-4">
//               <h2 className="text-base font-semibold">Verify OTP</h2>
//               <p className="text-xs text-purple-100">Confirm inspection with tenant</p>
//             </div>
//             <div className="space-y-4">
//               <div className="bg-purple-50 p-3 rounded-lg">
//                 <p className="text-xs text-purple-800">OTP sent to {viewItem.tenant_phone}</p>
//                 <p className="text-[10px] text-purple-600 mt-1">Demo OTP: {generatedOTP}</p>
//               </div>
//               <div>
//                 <label className={L}>Enter OTP</label>
//                 <Input
//                   value={otpCode}
//                   onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
//                   maxLength={6}
//                   placeholder="6-digit OTP"
//                   className="text-center text-lg tracking-widest"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Button onClick={handleVerifyOTP} disabled={otpCode.length !== 6}
//                   className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
//                   Verify & Approve
//                 </Button>
//                 <Button variant="outline" onClick={() => setShowOTPModal(false)}>Cancel</Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes, Square, CheckSquare,
  AlertCircle,
  Edit
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  bulkDeleteInspections,
  getInspectionStats,
  getDefaultPenaltyRules
} from "@/lib/moveOutInspectionApi";
import { getHandovers } from "@/lib/handoverApi";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface PenaltyRule {
  id: string;
  item_category: string;
  from_condition: string;
  to_condition: string;
  penalty_amount: number;
  description?: string;
}

interface MoveOutInspection {
  id: string;
  handover_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id?: number;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date?: string;
  inspection_date: string;
  inspector_name: string;
  total_penalty: number;
  notes?: string;
  status: string;
  penalty_rules?: PenaltyRule[];
  inspection_items?: InspectionItem[];
  created_at?: string;
}

interface HandoverOption {
  id: string;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  room_number: string;
  bed_number?: string;
  move_in_date: string;
  status: string;
  handover_items?: any[];
}

type StatusType = 'all' | 'Completed' | 'Approved' | 'Pending' | 'Active' | 'Cancelled';

const CONDITIONS = ['New', 'Good', 'Used', 'Damaged', 'Missing'];

// ─── Style tokens ─────────────────────────────────────────────────────────────
const F = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L = "block text-[11px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[11px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest pb-1 mb-2 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <Card className={`${bg} border-0 shadow-sm`}>
    <CardContent className="p-2 sm:p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] sm:text-xs text-slate-600 font-medium">{title}</p>
          <p className="text-sm sm:text-base font-bold text-slate-800">{value}</p>
        </div>
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const statusColor = (s: string) => {
  switch (s) {
    case 'Approved': return 'bg-emerald-100 text-emerald-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'Active': return 'bg-blue-100 text-blue-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const conditionColor = (c: string) => {
  switch (c) {
    case 'New': return 'bg-green-100 text-green-700';
    case 'Good': return 'bg-blue-100 text-blue-700';
    case 'Used': return 'bg-yellow-100 text-yellow-700';
    case 'Damaged': return 'bg-orange-100 text-orange-700';
    case 'Missing': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const fmt = (d: string | undefined | null) => {
  if (!d) return 'N/A';
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-IN');
  } catch {
    return 'N/A';
  }
};

const toInputDate = (d: string | undefined | null): string => {
  if (!d) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const safeNum = (v: any): number => {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const money = (n: any) => `₹${safeNum(n).toLocaleString('en-IN')}`;
const pdfMoney = (n: any) => `Rs. ${safeNum(n).toLocaleString('en-IN')}`;

export function MoveOutInspection() {
  const [inspections, setInspections] = useState<MoveOutInspection[]>([]);
  const [handovers, setHandovers] = useState<HandoverOption[]>([]);
  const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MoveOutInspection | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewItem, setViewItem] = useState<MoveOutInspection | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [selectedHandover, setSelectedHandover] = useState<HandoverOption | null>(null);
  const [loadingHandovers, setLoadingHandovers] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
const [handoverSearchTerm, setHandoverSearchTerm] = useState('');
const [propertyFilterSearchTerm, setPropertyFilterSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [stats, setStats] = useState({
    total: 0, completed: 0, approved: 0, pending: 0, active: 0, cancelled: 0,
    total_penalties: 0, avg_penalty: 0, max_penalty: 0, total_properties: 0
  });

  const [statusFilter, setStatusFilter] = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

  const emptyForm = {
    handover_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    total_penalty: 0,
    notes: '',
    status: 'Pending'
  };
  const [formData, setFormData] = useState(emptyForm);

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const res = await getInspections(filters);
      console.log('Inspections loaded:', res);
      
      // Ensure data is properly formatted
      const data: MoveOutInspection[] = (res.data || []).map(i => {
  let items = i.inspection_items || [];
  if (typeof items === 'string') {
    try { items = JSON.parse(items); } catch { items = []; }
  }
  return {
    ...i,
    id: String(i.id),
    handover_id: String(i.handover_id),
    total_penalty: safeNum(i.total_penalty),
    inspection_items: Array.isArray(items) ? items : []
  };
});
      setInspections(data);

      try {
        const statsRes = await getInspectionStats();
        setStats(statsRes.data);
      } catch (statsErr) {
        console.error('Failed to load stats:', statsErr);
      }

      // Extract unique properties for filter
      const uniqueProps = Array.from(new Set(data.map(i => i.property_name)))
        .filter(Boolean)
        .map(name => ({ id: name, name }));
      setProperties(uniqueProps);
    } catch (err: any) {
      console.error('Failed to load inspections:', err);
      toast.error(err.message || 'Failed to load inspections');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

  const loadHandovers = useCallback(async () => {
    try {
      setLoadingHandovers(true);
      const res = await getHandovers({ status: 'Active' });
      console.log('Handovers loaded:', res);
      
      const data = (res.data || []).map(h => ({
        id: String(h.id),
        tenant_name: h.tenant_name,
        tenant_phone: h.tenant_phone,
        property_name: h.property_name,
        room_number: h.room_number,
        bed_number: h.bed_number,
        move_in_date: h.move_in_date,
        status: h.status,
        handover_items: h.handover_items || []
      }));
      setHandovers(data);
    } catch (err: any) {
      console.error('Failed to load handovers:', err);
      toast.error(err.message || 'Failed to load handovers');
    } finally {
      setLoadingHandovers(false);
    }
  }, []);

  const loadPenaltyRules = useCallback(async () => {
    try {
      const res = await getDefaultPenaltyRules();
      console.log('Penalty rules loaded:', res);
      setPenaltyRules(res.data || []);
    } catch (err: any) {
      console.error('Failed to load penalty rules:', err);
      // Use default rules if API fails
      setPenaltyRules([
        { id: '1', item_category: 'Furniture', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 1000 },
        { id: '2', item_category: 'Furniture', from_condition: 'Good', to_condition: 'Damaged', penalty_amount: 500 },
        { id: '3', item_category: 'Electronics', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 2000 },
        { id: '4', item_category: 'Kitchen', from_condition: 'New', to_condition: 'Damaged', penalty_amount: 800 },
      ]);
    }
  }, []);

  useEffect(() => {
    loadAll();
    loadHandovers();
    loadPenaltyRules();
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Handover selection ───────────────────────────────────────────────────────
  const handleHandoverSelect = async (handoverId: string) => {
    if (!handoverId) {
      setSelectedHandover(null);
      setInspectionItems([]);
      return;
    }

    const handover = handovers.find(h => h.id === handoverId);
    if (!handover) return;

    setSelectedHandover(handover);
    setFormData(p => ({
      ...p,
      handover_id: handoverId
    }));

    setLoadingItems(true);
    try {
      // Simulate API delay - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize inspection items from handover items
      if (handover.handover_items && handover.handover_items.length > 0) {
        const items: InspectionItem[] = handover.handover_items.map((item: any, index: number) => ({
          handover_item_id: item.id || String(index),
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          condition_at_movein: item.condition_at_movein,
          condition_at_moveout: item.condition_at_movein, // Default to same as move-in
          penalty_amount: 0,
          notes: ''
        }));
        setInspectionItems(items);
        console.log('Loaded inspection items:', items);
      } else {
        // Create sample items for demo if none exist
        const sampleItems: InspectionItem[] = [
          {
            handover_item_id: 'sample1',
            item_name: 'King Size Bed',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Good',
            condition_at_moveout: 'Good',
            penalty_amount: 0,
            notes: ''
          },
          {
            handover_item_id: 'sample2',
            item_name: 'Wardrobe',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Good',
            condition_at_moveout: 'Good',
            penalty_amount: 0,
            notes: ''
          },
          {
            handover_item_id: 'sample3',
            item_name: 'Study Table',
            category: 'Furniture',
            quantity: 1,
            condition_at_movein: 'Used',
            condition_at_moveout: 'Used',
            penalty_amount: 0,
            notes: ''
          }
        ];
        setInspectionItems(sampleItems);
        toast.info('Sample items loaded for demo');
      }
    } catch (error) {
      console.error('Failed to load items:', error);
      toast.error('Failed to load handover items');
    } finally {
      setLoadingItems(false);
    }
  };

  // ── Calculate penalty based on rules ─────────────────────────────────────────
  const calculatePenalty = (
    category: string,
    fromCondition: string,
    toCondition: string
  ): number => {
    if (fromCondition === toCondition) return 0;

    // If missing, apply high penalty
    if (toCondition === 'Missing') {
      const categoryRules = penaltyRules.filter(r => r.item_category === category);
      if (categoryRules.length > 0) {
        return Math.max(...categoryRules.map(r => r.penalty_amount)) * 2;
      }
      return 5000; // Default missing penalty
    }

    const rule = penaltyRules.find(r =>
      r.item_category === category &&
      r.from_condition === fromCondition &&
      r.to_condition === toCondition
    );

    return rule?.penalty_amount || 0;
  };

  // ── Update inspection item ───────────────────────────────────────────────────
  const updateInspectionItem = (index: number, field: keyof InspectionItem, value: any) => {
    const newItems = [...inspectionItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'condition_at_moveout') {
      const item = newItems[index];
      const penalty = calculatePenalty(
        item.category,
        item.condition_at_movein,
        value
      );
      newItems[index].penalty_amount = penalty;
    }

    setInspectionItems(newItems);

    // Update total penalty
    const total = newItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
    setFormData(p => ({ ...p, total_penalty: total }));
  };

  // ── Filtered rows ───────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return inspections.filter(i => {
      const cs = colSearch;
      const tn = !cs.tenant_name || i.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const pn = !cs.property_name || i.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const rn = !cs.room_number || i.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const ins = !cs.inspector_name || i.inspector_name?.toLowerCase().includes(cs.inspector_name.toLowerCase());
      const s = !cs.status || i.status?.toLowerCase().includes(cs.status.toLowerCase());
      const d = !cs.inspection_date || fmt(i.inspection_date).includes(cs.inspection_date);
      return tn && pn && rn && ins && s && d;
    });
  }, [inspections, colSearch]);

  // ── Bulk Selection ───────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredItems.length && filteredItems.length > 0);
  };

  // ── CRUD Operations ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setSelectedHandover(null);
    setFormData({
      ...emptyForm,
      inspection_date: new Date().toISOString().split('T')[0]
    });
    setInspectionItems([]);
    setCurrentStep(1);
    setShowForm(true);
  };

  const openEdit = async (inspection: MoveOutInspection) => {
    try {
      setLoading(true);
      console.log('Opening edit for inspection:', inspection);
      
      let fullData = inspection;
      if (inspection.id) {
        try {
          const fullInspection = await getInspectionById(inspection.id);
          fullData = fullInspection.data;
          console.log('Full inspection data:', fullData);
        } catch (err) {
          console.warn('Could not fetch full details, using provided data');
        }
      }

      setEditingItem(fullData);
      
      // Create handover object from inspection data
      setSelectedHandover({
        id: fullData.handover_id,
        tenant_name: fullData.tenant_name,
        tenant_phone: fullData.tenant_phone,
        property_name: fullData.property_name,
        room_number: fullData.room_number,
        bed_number: fullData.bed_number || '',
        move_in_date: fullData.move_in_date || '',
        status: 'Active',
        handover_items: []
      });

      setFormData({
        handover_id: fullData.handover_id,
        inspection_date: toInputDate(fullData.inspection_date) || new Date().toISOString().split('T')[0],
        inspector_name: fullData.inspector_name || '',
        total_penalty: safeNum(fullData.total_penalty),
        notes: fullData.notes || '',
        status: fullData.status || 'Pending'
      });

      // Ensure inspection items are properly formatted
    const rawItems = fullData.inspection_items;
const items = (Array.isArray(rawItems) ? rawItems : []).map(item => ({
  handover_item_id: String(item.handover_item_id || item.id || Math.random()),
  item_name: item.item_name || '',
  category: item.category || '',
  quantity: Number(item.quantity) || 1,
  condition_at_movein: item.condition_at_movein || 'Good',
  condition_at_moveout: item.condition_at_moveout || item.condition_at_movein || 'Good',
  penalty_amount: parseFloat(String(item.penalty_amount)) || 0,
  notes: item.notes || ''
}));
      
      setInspectionItems(items);
      console.log('Set inspection items for edit:', items);
      
      setCurrentStep(2);
      setShowForm(true);
    } catch (err: any) {
      console.error('Failed to load inspection details:', err);
      toast.error(err.message || 'Failed to load inspection details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.handover_id) {
      toast.error('Please select a handover');
      return;
    }
    if (!formData.inspector_name) {
      toast.error('Inspector name is required');
      return;
    }
    if (currentStep === 1) {
      if (inspectionItems.length === 0) {
        toast.error('No items to inspect');
        return;
      }
      setCurrentStep(2);
      return;
    }

    // Validate all items have condition selected
    for (let i = 0; i < inspectionItems.length; i++) {
      if (!inspectionItems[i].condition_at_moveout) {
        toast.error(`Please select condition for item: ${inspectionItems[i].item_name}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const totalPenalty = inspectionItems.reduce((sum, item) => sum + (item.penalty_amount || 0), 0);
      
      const payload = {
        handover_id: formData.handover_id,
        inspection_date: formData.inspection_date,
        inspector_name: formData.inspector_name,
        total_penalty: totalPenalty,
        notes: formData.notes,
        status: formData.status || 'Completed',
        inspection_items: inspectionItems.map(item => ({
          handover_item_id: item.handover_item_id,
          item_name: item.item_name,
          category: item.category,
          quantity: item.quantity,
          condition_at_movein: item.condition_at_movein,
          condition_at_moveout: item.condition_at_moveout,
          penalty_amount: item.penalty_amount || 0,
          notes: item.notes || ''
        }))
      };

      console.log('Submitting payload:', payload);

      if (editingItem) {
        await updateInspection(editingItem.id, payload);
        toast.success('Inspection updated successfully');
      } else {
        await createInspection(payload);
        toast.success('Inspection created successfully');
      }

      setShowForm(false);
      await loadAll();
    } catch (err: any) {
      console.error('Failed to save inspection:', err);
      toast.error(err.message || 'Failed to save inspection');
    } finally {
      setSubmitting(false);
    }
  };

 const handleDelete = async (id: string, name?: string) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete inspection for "${name || id}"? This cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    width: '400px',
    padding: '1.5rem',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-gray-800',
      htmlContainer: 'text-sm text-gray-600 my-2',
      confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
      cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
      actions: 'flex justify-center gap-2 mt-4'
    },
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  try {
    await deleteInspection(id);
    await loadAll();
    
    Swal.fire({
      title: 'Deleted!',
      text: 'Inspection record deleted successfully.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-green-600',
        htmlContainer: 'text-xs text-gray-600'
      }
    });
  } catch (err: any) {
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete inspection',
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
  }
};

  const handleBulkDelete = async () => {
  if (selectedItems.size === 0) {
    Swal.fire({
      title: 'No items selected',
      text: 'Please select at least one record to delete.',
      icon: 'info',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-blue-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
    return;
  }

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Delete ${selectedItems.size} selected inspection record(s)? This cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete them!',
    cancelButtonText: 'Cancel',
    background: '#fff',
    backdrop: `rgba(0,0,0,0.4)`,
    width: '400px',
    padding: '1.5rem',
    customClass: {
      popup: 'rounded-xl shadow-2xl',
      title: 'text-lg font-bold text-gray-800',
      htmlContainer: 'text-sm text-gray-600 my-2',
      confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
      cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
      actions: 'flex justify-center gap-2 mt-4'
    },
    buttonsStyling: false,
  });

  if (!result.isConfirmed) return;

  try {
    await bulkDeleteInspections(Array.from(selectedItems));
    await loadAll();
    setSelectedItems(new Set());
    setSelectAll(false);
    
    Swal.fire({
      title: 'Deleted!',
      text: `${selectedItems.size} record(s) deleted successfully.`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-green-600',
        htmlContainer: 'text-xs text-gray-600'
      }
    });
  } catch (err: any) {
    Swal.fire({
      title: 'Error!',
      text: err.message || 'Failed to delete records',
      icon: 'error',
      confirmButtonText: 'OK',
      width: '350px',
      padding: '1rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-base font-bold text-red-600',
        htmlContainer: 'text-xs text-gray-600',
        confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
      },
      buttonsStyling: false
    });
  }
};

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Tenant', 'Phone', 'Property', 'Room', 'Inspector', 'Inspection Date', 'Total Penalty', 'Items', 'Status'];
    const rows = filteredItems.map(i => [
      i.tenant_name,
      i.tenant_phone,
      i.property_name,
      `${i.room_number}${i.bed_number ? `/${i.bed_number}` : ''}`,
      i.inspector_name,
      fmt(i.inspection_date),
      money(i.total_penalty),
      i.inspection_items?.length || 0,
      i.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `moveout_inspections_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ── PDF Generation ───────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!viewItem) return;

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = margin;

      const docId = String(viewItem.id).substring(0, 8).toUpperCase();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MOVE-OUT INSPECTION REPORT', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Document ID: ${docId}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Tenant Info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenant Information', margin, yPos);
      yPos += 6;

      const tenantInfo = [
        ['Tenant Name:', viewItem.tenant_name],
        ['Phone:', viewItem.tenant_phone],
        ['Email:', viewItem.tenant_email || 'N/A'],
        ['Property:', viewItem.property_name],
        ['Room:', `${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}`],
        ['Move-in Date:', fmt(viewItem.move_in_date)],
      ];

      doc.setFontSize(10);
      tenantInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 40, yPos);
        yPos += 6;
      });
      yPos += 4;

      // Inspection Details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Details', margin, yPos);
      yPos += 6;

      const inspectionInfo = [
        ['Inspection Date:', fmt(viewItem.inspection_date)],
        ['Inspector:', viewItem.inspector_name],
        ['Total Penalty:', pdfMoney(viewItem.total_penalty)],
        ['Status:', viewItem.status],
      ];

      doc.setFontSize(10);
      inspectionInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), margin + 40, yPos);
        yPos += 6;
      });

      // Items Table
      if (viewItem.inspection_items && viewItem.inspection_items.length > 0) {
        yPos += 4;
        if (yPos > 250) { doc.addPage(); yPos = margin; }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Inspection Checklist (${viewItem.inspection_items.length} Items)`, margin, yPos);
        yPos += 8;

        const tableData = viewItem.inspection_items.map((item, idx) => [
          (idx + 1).toString(),
          item.item_name,
          item.category,
          item.quantity.toString(),
          item.condition_at_movein,
          item.condition_at_moveout,
          pdfMoney(item.penalty_amount),
          item.notes || '-',
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Item Name', 'Category', 'Qty', 'Move-in', 'Move-out', 'Penalty', 'Notes']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235], textColor: 255 },
          margin: { left: margin, right: margin },
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Notes
      if (viewItem.notes) {
        if (yPos > 250) { doc.addPage(); yPos = margin; }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Additional Notes:', margin, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const notesLines = doc.splitTextToSize(viewItem.notes, pageWidth - 2 * margin);
        doc.text(notesLines, margin, yPos);
        yPos += notesLines.length * 5 + 10;
      }

      // Signatures
      if (yPos > 250) { doc.addPage(); yPos = margin; }
      yPos += 10;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Signatures', margin, yPos);
      yPos += 10;

      const signatureWidth = (pageWidth - 2 * margin - 20) / 3;
      const signatures = [
        { name: viewItem.tenant_name, label: 'Tenant Signature', date: fmt(viewItem.inspection_date) },
        { name: viewItem.inspector_name, label: 'Inspector/Manager', date: fmt(viewItem.inspection_date) },
        { name: 'Witness', label: 'Witness Signature', date: '__________' },
      ];

      signatures.forEach((sig, idx) => {
        const xPos = margin + idx * (signatureWidth + 10);
        doc.line(xPos, yPos + 15, xPos + signatureWidth, yPos + 15);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(sig.name, xPos + signatureWidth / 2, yPos + 20, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(sig.label, xPos + signatureWidth / 2, yPos + 25, { align: 'center' });
        doc.text(`Date: ${sig.date}`, xPos + signatureWidth / 2, yPos + 30, { align: 'center' });
      });

      const fileName = `MoveOut_Inspection_${viewItem.tenant_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success('PDF downloaded successfully');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  // ── Share WhatsApp ───────────────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    if (!viewItem) return;

    try {
      const phoneNumber = viewItem.tenant_phone.replace(/\D/g, '');
      if (!phoneNumber) { toast.error('Phone number is missing'); return; }

      const message = encodeURIComponent(
        `📋 *MOVE-OUT INSPECTION REPORT*\n\n` +
        `*Tenant:* ${viewItem.tenant_name}\n` +
        `*Phone:* ${viewItem.tenant_phone}\n` +
        `*Property:* ${viewItem.property_name}\n` +
        `*Room:* ${viewItem.room_number}${viewItem.bed_number ? ` / ${viewItem.bed_number}` : ''}\n` +
        `*Inspection Date:* ${fmt(viewItem.inspection_date)}\n` +
        `*Inspector:* ${viewItem.inspector_name}\n` +
        `*Total Penalty:* ${money(viewItem.total_penalty)}\n` +
        `*Items Inspected:* ${viewItem.inspection_items?.length || 0}\n` +
        `*Status:* ${viewItem.status}`
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    } catch (err) {
      toast.error('Failed to share via WhatsApp');
    }
  };

  const handlePrint = () => window.print();

  // ── OTP Verification ─────────────────────────────────────────────────────────
  const handleInitiateOTP = () => {
    if (!viewItem) return;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(otp);
    setOtpCode('');
    setShowOTPModal(true);
    toast.info(`OTP: ${otp} (demo mode)`);
  };

  const handleVerifyOTP = async () => {
    if (otpCode !== generatedOTP) { toast.error('Invalid OTP'); return; }

    try {
      if (viewItem) {
        await updateInspection(viewItem.id, { ...viewItem, status: 'Approved' });
        await loadAll();
        toast.success('Inspection approved via OTP!');
        setShowOTPModal(false);
        setViewItem(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const hasFilters = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch = Object.values(colSearch).some(v => v !== '');
  const activeCount = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({
    tenant_name: '', property_name: '', room_number: '', inspector_name: '', status: '', inspection_date: ''
  });

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20">
        <div className="px-3 sm:px-5 pt-3 pb-2 flex items-end justify-end gap-2">
          <div className="flex items-end justify-end gap-1.5 flex-shrink-0">

            <button onClick={() => setSidebarOpen(o => !o)}
              className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-[11px] font-medium transition-colors
                ${sidebarOpen || hasFilters ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              <Filter className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">Filters</span>
              {activeCount > 0 && (
                <span className={`h-4 w-4 rounded-full text-[9px] font-bold flex items-center justify-center
                  ${sidebarOpen || hasFilters ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                  {activeCount}
                </span>
              )}
            </button>

            <button onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-[11px] font-medium transition-colors">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button onClick={loadAll} disabled={loading}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={openAdd}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-semibold shadow-sm transition-colors">
              <Plus className="h-3.5 w-3.5 flex-shrink-0" />
              <span className=" xs:inline">New Inspection</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 sm:px-5 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
            <StatCard title="Total Inspections" value={stats.total}
              icon={FileText} color="bg-blue-600" bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Total Penalties" value={money(stats.total_penalties)}
              icon={IndianRupee} color="bg-red-600" bg="bg-gradient-to-br from-red-50 to-red-100" />
            <StatCard title="Completed" value={stats.completed} icon={Check} color="bg-green-600" bg="bg-green-50" />
            <StatCard title="Approved" value={stats.approved} icon={ShieldCheck} color="bg-emerald-600" bg="bg-emerald-50" />
           <StatCard title="Pending" value={stats.pending} icon={AlertCircle} color="bg-amber-600" bg="bg-amber-50" />
            <StatCard title="Cancelled" value={stats.cancelled} icon={X} color="bg-red-600" bg="bg-red-50" />
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-1.5">
            
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-3 sm:p-4">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Inspections ({filteredItems.length})
                {selectedItems.size > 0 && (
                  <span className="ml-2 text-blue-600 text-xs">({selectedItems.size} selected)</span>
                )}
              </span>
              <div className="flex items-center gap-2">
                {selectedItems.size > 0 && (
                  <Button size="sm" variant="destructive"
                    className="h-7 text-[10px] px-2 bg-red-600 hover:bg-red-700"
                    onClick={handleBulkDelete}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete Selected ({selectedItems.size})
                  </Button>
                )}
                {hasColSearch && (
                  <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
                    Clear Search
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-auto max-h-[calc(100vh-310px)]">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs w-8">
                        <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 rounded">
                          {selectAll ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                        </button>
                      </TableHead>
                      <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Room/Bed</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Inspector</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Inspection Date</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Total Penalty</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Items</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    <TableRow className="bg-gray-50/80">
                      <TableCell className="py-1 px-2" />
                      {[
                        { key: 'tenant_name', ph: 'Search tenant…' },
                        { key: null, ph: '' },
                        { key: 'property_name', ph: 'Search prop…' },
                        { key: 'room_number', ph: 'Room…' },
                        { key: 'inspector_name', ph: 'Inspector…' },
                        { key: 'inspection_date', ph: 'Date…' },
                        { key: null, ph: '' },
                        { key: null, ph: '' },
                        { key: 'status', ph: 'Status…' },
                      ].map((col, idx) => (
                        <TableCell key={idx} className="py-1 px-2">
                          {col.key ? (
                            <Input placeholder={col.ph}
                              value={colSearch[col.key as keyof typeof colSearch]}
                              onChange={e => setColSearch(p => ({ ...p, [col.key!]: e.target.value }))}
                              className="h-6 text-[10px]"
                            />
                          ) : <div />}
                        </TableCell>
                      ))}
                      <TableCell className="py-1 px-2" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading inspections…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-12">
                          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No inspections found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(i => (
                      <TableRow key={i.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3">
                          <button onClick={() => toggleSelectItem(i.id)} className="p-1 hover:bg-gray-200 rounded">
                            {selectedItems.has(i.id) ? <CheckSquare className="h-3.5 w-3.5 text-blue-600" /> : <Square className="h-3.5 w-3.5 text-gray-400" />}
                          </button>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium">{i.tenant_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{i.tenant_phone}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[140px] truncate">{i.property_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          {i.room_number}{i.bed_number ? ` / ${i.bed_number}` : ''}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{i.inspector_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(i.inspection_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">
                          <span className={i.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                            {money(i.total_penalty)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs">
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                            {i.inspection_items?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 ${statusColor(i.status)}`}>{i.status}</Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={async () => {
  try {
    const full = await getInspectionById(i.id);
    setViewItem(full.data);
  } catch {
    setViewItem(i);
  }
}} title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => openEdit(i)} title="Edit">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(i.id, i.tenant_name)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </main>

        {/* ── FILTER DRAWER ────────────────────────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 backdrop-blur-[1px]" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed top-0 right-0 h-full z-40 w-72 sm:w-80 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">Filters</span>
              {hasFilters && (
                <span className="h-5 px-1.5 rounded-full bg-white text-blue-700 text-[9px] font-bold flex items-center">
                  {activeCount} active
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={clearFilters} className="text-[10px] text-blue-200 hover:text-white font-semibold">
                  Clear all
                </button>
              )}
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
              </p>
              <div className="space-y-1">
                {(['all', 'Completed', 'Approved', 'Pending', 'Active', 'Cancelled'] as StatusType[]).map(s => (
                  <label key={s} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                    ${statusFilter === s ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
                    <input type="radio" name="status" value={s} checked={statusFilter === s}
                      onChange={() => setStatusFilter(s)} className="sr-only" />
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${statusFilter === s ? 'bg-blue-500' : 'bg-gray-300'}`} />
                    <span className="text-[12px] font-medium">{s === 'all' ? 'All Statuses' : s}</span>
                    {statusFilter === s && (
                      <span className="ml-auto">
                        <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100" />
           <div>
  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
    <Building className="h-3 w-3 text-indigo-500" /> Property
  </p>
  
  {/* Search input for properties */}
  <div className="relative mb-2">
    <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <Input
      placeholder="Search properties..."
      className="pl-7 h-7 text-xs"
      value={propertyFilterSearchTerm}
      onChange={(e) => setPropertyFilterSearchTerm(e.target.value)}
    />
  </div>
  
  <div className="space-y-1 max-h-[200px] overflow-y-auto">
    <label className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
      ${propertyFilter === 'all' ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
      <input type="radio" name="prop" value="all" checked={propertyFilter === 'all'}
        onChange={() => setPropertyFilter('all')} className="sr-only" />
      <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === 'all' ? 'bg-blue-500' : 'bg-gray-300'}`} />
      <span className="text-[12px] font-medium">All Properties</span>
      {propertyFilter === 'all' && (
        <span className="ml-auto">
          <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </label>
    
    {properties
      .filter(p => p.name.toLowerCase().includes(propertyFilterSearchTerm.toLowerCase()))
      .map(p => (
        <label key={p.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${propertyFilter === p.id ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'hover:bg-gray-50 border border-transparent text-gray-700'}`}>
          <input type="radio" name="prop" value={p.id} checked={propertyFilter === p.id}
            onChange={() => setPropertyFilter(p.id)} className="sr-only" />
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${propertyFilter === p.id ? 'bg-blue-500' : 'bg-gray-300'}`} />
          <span className="text-[12px] font-medium truncate">{p.name}</span>
          {propertyFilter === p.id && (
            <span className="ml-auto flex-shrink-0">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </label>
      ))}
      
    {/* Show message if no results */}
    {properties.filter(p => p.name.toLowerCase().includes(propertyFilterSearchTerm.toLowerCase())).length === 0 && (
      <div className="px-2 py-3 text-center">
        <p className="text-xs text-gray-400">No properties found</p>
      </div>
    )}
  </div>
</div>
          </div>

          <div className="flex-shrink-0 border-t px-4 py-3 bg-gray-50 flex gap-2">
            <button onClick={clearFilters} disabled={!hasFilters}
              className="flex-1 h-8 rounded-lg border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed">
              Clear All
            </button>
            <button onClick={() => setSidebarOpen(false)}
              className="flex-1 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-semibold hover:from-blue-700 hover:to-indigo-700">
              Apply & Close
            </button>
          </div>
        </aside>
      </div>

      {/* ══ ADD / EDIT DIALOG ════════════════════════════════════════════════ */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) setShowForm(false); }}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Inspection' : 'New Move-Out Inspection'}</h2>
              <p className="text-xs text-blue-100">
                Step {currentStep} of 2 — {currentStep === 1 ? 'Select Handover' : 'Inspect Items'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </span>
                <div className="h-0.5 w-4 bg-blue-400" />
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>2</span>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

            {/* ── STEP 1 ── */}
            {currentStep === 1 && (
              <>
                <div>
                  <SH icon={<User className="h-3 w-3" />} title="Select Tenant Handover" />
                 <div>
  <label className={L}>Handover <span className="text-red-400">*</span></label>
  {loadingHandovers ? (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    </div>
  ) : (
    <Select 
      value={formData.handover_id} 
      onValueChange={(v) => {
        handleHandoverSelect(v);
        setHandoverSearchTerm('');
      }}
    >
      <SelectTrigger className={F}>
        <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
        <SelectValue placeholder="Select active handover" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {/* Search input */}
        <div className="sticky top-0 bg-white p-2 border-b z-10">
          <div className="relative">
            <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              placeholder="Search handovers..."
              className="pl-7 h-7 text-xs"
              value={handoverSearchTerm}
              onChange={(e) => setHandoverSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        {/* Handovers list */}
        <div className="py-1">
          {handovers
            .filter(h => 
              h.tenant_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
              h.property_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
              h.room_number.toLowerCase().includes(handoverSearchTerm.toLowerCase())
            )
            .map(h => (
              <SelectItem key={h.id} value={String(h.id)} className={SI}>
                {h.tenant_name} — {h.property_name} Room {h.room_number}
                {h.bed_number ? `/${h.bed_number}` : ''}
              </SelectItem>
            ))}
          
          {/* Show message if no results */}
          {handovers.filter(h => 
            h.tenant_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
            h.property_name.toLowerCase().includes(handoverSearchTerm.toLowerCase()) ||
            h.room_number.toLowerCase().includes(handoverSearchTerm.toLowerCase())
          ).length === 0 && (
            <div className="px-2 py-3 text-center">
              <p className="text-xs text-gray-400">No handovers found</p>
            </div>
          )}
        </div>
      </SelectContent>
    </Select>
  )}
</div>
                </div>

                {selectedHandover && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <SH icon={<Building className="h-3 w-3" />} title="Handover Details" color="text-blue-700" />
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div><span className="font-semibold">Tenant:</span> {selectedHandover.tenant_name}</div>
                      <div><span className="font-semibold">Phone:</span> {selectedHandover.tenant_phone}</div>
                      <div><span className="font-semibold">Property:</span> {selectedHandover.property_name}</div>
                      <div><span className="font-semibold">Room:</span> {selectedHandover.room_number}{selectedHandover.bed_number ? `/${selectedHandover.bed_number}` : ''}</div>
                      <div><span className="font-semibold">Move-in:</span> {fmt(selectedHandover.move_in_date)}</div>
                      <div><span className="font-semibold">Items:</span> {selectedHandover.handover_items?.length || 0}</div>
                    </div>
                  </div>
                )}

                <div>
                  <SH icon={<Calendar className="h-3 w-3" />} title="Inspection Details" color="text-green-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <label className={L}>Inspector Name <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="Inspector name"
                        value={formData.inspector_name}
                        onChange={e => setFormData(p => ({ ...p, inspector_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className={L}>Inspection Date <span className="text-red-400">*</span></label>
                      <Input type="date" className={F}
                        value={formData.inspection_date}
                        onChange={e => setFormData(p => ({ ...p, inspection_date: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div>
                  <SH icon={<StickyNote className="h-3 w-3" />} title="Notes" color="text-amber-600" />
                  <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
                    rows={2} placeholder="Additional notes…"
                    value={formData.notes}
                    onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                </div>

                {loadingItems && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    <span className="ml-2 text-xs text-gray-600">Loading items...</span>
                  </div>
                )}

                {inspectionItems.length > 0 && !loadingItems && (
                  <div className="bg-green-50 rounded-lg p-2 text-[11px] text-green-700 flex items-center gap-2">
                    <Check className="h-3.5 w-3.5" />
                    {inspectionItems.length} items loaded for inspection
                  </div>
                )}
              </>
            )}

            {/* ── STEP 2: Item Inspection ── */}
           {currentStep === 2 && (
  <div>
    <SH icon={<FileText className="h-3 w-3" />} title="Item Inspection Checklist" />
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-amber-800 font-semibold">
            Inspect each item and select its condition at move-out. Penalties will be calculated automatically based on condition changes.
          </p>
          <div className="bg-white rounded-lg p-2 mt-2 border border-amber-200">
            <div className="text-sm font-bold text-gray-900">
              Total Penalty: <span className={formData.total_penalty > 0 ? 'text-red-600' : 'text-green-600'}>
                {money(formData.total_penalty)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-1">
  {inspectionItems.map((item, idx) => (
    <div key={idx} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-bold text-gray-900 text-sm">{item.item_name}</div>
          <div className="text-xs text-gray-600 mt-1">
            Category: <span className="font-semibold">{item.category}</span> |
            Quantity: <span className="font-semibold">{item.quantity}</span>
          </div>
        </div>

        {item.penalty_amount > 0 && (
          <Badge className="bg-red-100 text-red-700 border border-red-200 px-2 py-1 text-xs whitespace-nowrap ml-1">
            Penalty: {money(item.penalty_amount)}
          </Badge>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Condition at Move-in</label>
          <Badge className={`text-xs px-2 py-1 block w-fit ${conditionColor(item.condition_at_movein)}`}>
            {item.condition_at_movein}
          </Badge>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Condition at Move-out *</label>
          <Select
            value={item.condition_at_moveout}
            onValueChange={v => updateInspectionItem(idx, 'condition_at_moveout', v)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map(c => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-medium text-gray-600">Custom Penalty Amount (₹)</label>
          <Input
            type="number"
            min={0}
            className="h-8 text-xs"
            value={item.penalty_amount}
            onChange={e =>
              updateInspectionItem(idx, 'penalty_amount', parseFloat(e.target.value) || 0)
            }
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-gray-600">Notes / Damage Description</label>
        <Input
          className="h-8 text-xs w-full"
          placeholder="Describe any damage or issues..."
          value={item.notes || ''}
          onChange={e => updateInspectionItem(idx, 'notes', e.target.value)}
        />
      </div>

    </div>
  ))}
</div>

    <div className="mt-4">
      <SH icon={<StickyNote className="h-3 w-3" />} title="Status" color="text-purple-600" />
      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Approved">Approved</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Active">Active</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
)}

            {/* Navigation */}
            <div className="flex gap-2 pt-4 border-t">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}
                  className="h-8 text-[11px] px-4 flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              <Button disabled={submitting || loadingItems} onClick={handleSubmit}
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                ) : currentStep === 1 ? (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                ) : editingItem ? (
                  <><Check className="h-3.5 w-3.5" /> Update Inspection</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Complete Inspection</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DIALOG ══════════════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Move-Out Inspection Report</h2>
                <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
              </div>
            <div className="flex items-center gap-2">
  <button 
    onClick={handleDownloadPDF} 
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
    title="Download PDF"
  >
    <FileDown className="h-3.5 w-3.5" />
    <span className="hidden sm:inline"> Download PDF</span>
  </button>
  <button 
    onClick={handleShareWhatsApp} 
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
    title="Share on WhatsApp"
  >
    <MessageCircle className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Share</span>
  </button>
  <button 
    onClick={handlePrint} 
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
    title="Print"
  >
    <Printer className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Print</span>
  </button>
  {viewItem.status !== 'Approved' && (
    <button 
      onClick={handleInitiateOTP} 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/20 text-white text-[11px] font-medium transition-colors"
      title="Verify with OTP"
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Verify</span>
    </button>
  )}
  <DialogClose asChild>
    <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
  </DialogClose>
</div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Tenant', viewItem.tenant_name],
                  ['Phone', viewItem.tenant_phone],
                  ['Email', viewItem.tenant_email || 'N/A'],
                  ['Property', viewItem.property_name],
                  ['Room/Bed', `${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}`],
                  ['Move-in', fmt(viewItem.move_in_date)],
                  ['Inspection Date', fmt(viewItem.inspection_date)],
                  ['Inspector', viewItem.inspector_name],
                  ['Total Penalty', money(viewItem.total_penalty)],
                  ['Status', viewItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {viewItem.inspection_items && viewItem.inspection_items.length > 0 ? (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2 flex items-center justify-between">
                    <span>Inspection Checklist</span>
                    <Badge className="bg-blue-100 text-blue-700 text-[9px] px-2">
                      {viewItem.inspection_items.length} Items
                    </Badge>
                  </p>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Item Name</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-center font-semibold">Qty</th>
                          <th className="px-3 py-2 text-center font-semibold">Move-in</th>
                          <th className="px-3 py-2 text-center font-semibold">Move-out</th>
                          <th className="px-3 py-2 text-right font-semibold">Penalty</th>
                          <th className="px-3 py-2 text-left font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.inspection_items.map((item, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-bold text-gray-500 border-r border-gray-200">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-200">{item.item_name}</td>
                            <td className="px-3 py-2 text-gray-600 border-r border-gray-200">
                              <Badge className="bg-blue-100 text-blue-700 text-[8px] px-1">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center font-semibold border-r border-gray-200">{item.quantity}</td>
                            <td className="px-3 py-2 text-center border-r border-gray-200">
                              <Badge className={`text-[8px] px-1 ${conditionColor(item.condition_at_movein)}`}>
                                {item.condition_at_movein}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-center border-r border-gray-200">
                              <Badge className={`text-[8px] px-1 ${conditionColor(item.condition_at_moveout)}`}>
                                {item.condition_at_moveout}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-red-600 border-r border-gray-200">
                              {money(item.penalty_amount)}
                            </td>
                            <td className="px-3 py-2 text-gray-500">{item.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-100 font-bold">
                        <tr>
                          <td colSpan={6} className="px-3 py-2 text-right">Total Penalty:</td>
                          <td className="px-3 py-2 text-right text-red-600">{money(viewItem.total_penalty)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-xs text-yellow-700">No inspection items found for this record.</p>
                </div>
              )}

              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Additional Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.tenant_name}</p>
                    <p className="text-[9px] text-gray-500">Tenant Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">{viewItem.inspector_name}</p>
                    <p className="text-[9px] text-gray-500">Inspector/Manager</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: {fmt(viewItem.inspection_date)}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-400 mb-2 pb-8"></div>
                    <p className="text-xs font-bold text-gray-800">Witness</p>
                    <p className="text-[9px] text-gray-500">Witness Signature</p>
                    <p className="text-[8px] text-gray-400 mt-1">Date: __________</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                <p className="text-[8px] text-blue-800">
                  This is an official move-out inspection document. By signing, both parties acknowledge the accuracy of the inspection results.
                </p>
                <p className="text-[8px] text-blue-700 mt-1 font-semibold">Status: {viewItem.status}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ══ OTP Modal ════════════════════════════════════════════════════════ */}
      {showOTPModal && viewItem && (
        <Dialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <DialogContent className="max-w-md">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-t-lg -mt-4 -mx-4 mb-4">
              <h2 className="text-base font-semibold">Verify OTP</h2>
              <p className="text-xs text-purple-100">Confirm inspection with tenant</p>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-800">OTP sent to {viewItem.tenant_phone}</p>
                <p className="text-[10px] text-purple-600 mt-1">Demo OTP: {generatedOTP}</p>
              </div>
              <div>
                <label className={L}>Enter OTP</label>
                <Input
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  placeholder="6-digit OTP"
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyOTP} disabled={otpCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600">
                  Verify & Approve
                </Button>
                <Button variant="outline" onClick={() => setShowOTPModal(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}