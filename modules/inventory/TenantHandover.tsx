// import { useEffect, useState, useMemo } from 'react';
// import { Plus, Loader2, X, Trash2, ChevronRight, ChevronLeft, Check, Eye, Share2, ShieldCheck, CreditCard as Edit, Trash, Printer, MessageCircle, FileDown, Filter } from 'lucide-react';
// import { DataTable } from '../../components/common/DataTable';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// interface TenantHandover {
//   id: string;
//   tenant_name: string;
//   tenant_phone: string;
//   tenant_email?: string;
//   property_name: string;
//   room_number: string;
//   bed_number?: string;
//   move_in_date: string;
//   handover_date: string;
//   inspector_name: string;
//   security_deposit: number;
//   rent_amount: number;
//   notes?: string;
//   status: string;
//   handover_items?: HandoverItem[];
// }

// interface HandoverItem {
//   id?: string;
//   handover_id?: string;
//   item_name: string;
//   category: string;
//   quantity: number;
//   condition_at_movein: string;
//   asset_id?: string;
//   notes?: string;
// }

// const CATEGORIES = ['Furniture', 'Electronics', 'Mattress', 'Utensils', 'Other'];
// const CONDITIONS = ['New', 'Good', 'Used', 'Damaged'];

// const currencyFormatter = new Intl.NumberFormat('en-IN', {
//   style: 'currency',
//   currency: 'INR'
// });

// const dateFormatter = (date: string) => {
//   if (!date) return 'N/A';
//   return new Date(date).toLocaleDateString('en-IN');
// };

// // Static data
// const staticHandovers: TenantHandover[] = [
//   {
//     id: '1',
//     tenant_name: 'Rahul Sharma',
//     tenant_phone: '9876543210',
//     tenant_email: 'rahul.sharma@email.com',
//     property_name: 'Sunset Villa',
//     room_number: '101',
//     bed_number: 'A',
//     move_in_date: '2026-01-15',
//     handover_date: '2026-01-15',
//     inspector_name: 'Sanjay Gupta',
//     security_deposit: 25000,
//     rent_amount: 12000,
//     notes: 'Handover completed successfully. All items in good condition.',
//     status: 'Confirmed',
//     handover_items: [
//       {
//         id: '101',
//         handover_id: '1',
//         item_name: 'King Size Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-001',
//         notes: 'Wooden frame with storage'
//       },
//       {
//         id: '102',
//         handover_id: '1',
//         item_name: 'Mattress',
//         category: 'Mattress',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-002',
//         notes: 'Memory foam'
//       },
//       {
//         id: '103',
//         handover_id: '1',
//         item_name: 'Wardrobe',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-003',
//         notes: '3-door wardrobe'
//       },
//       {
//         id: '104',
//         handover_id: '1',
//         item_name: 'Study Table',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-004',
//         notes: 'With drawer'
//       },
//       {
//         id: '105',
//         handover_id: '1',
//         item_name: 'Chair',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-005',
//         notes: 'Ergonomic chair'
//       }
//     ]
//   },
//   {
//     id: '2',
//     tenant_name: 'Priya Patel',
//     tenant_phone: '8765432109',
//     tenant_email: 'priya.patel@email.com',
//     property_name: 'Ocean View Apartment',
//     room_number: '205',
//     bed_number: 'B',
//     move_in_date: '2026-02-01',
//     handover_date: '2026-02-01',
//     inspector_name: 'Anjali Desai',
//     security_deposit: 30000,
//     rent_amount: 15000,
//     notes: 'Handover completed. Tenant requested additional shelf.',
//     status: 'Active',
//     handover_items: [
//       {
//         id: '201',
//         handover_id: '2',
//         item_name: 'Queen Size Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-006',
//         notes: 'With storage'
//       },
//       {
//         id: '202',
//         handover_id: '2',
//         item_name: 'Mattress',
//         category: 'Mattress',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-007',
//         notes: 'Pocket spring'
//       },
//       {
//         id: '203',
//         handover_id: '2',
//         item_name: 'Refrigerator',
//         category: 'Electronics',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-008',
//         notes: 'Single door, 190L'
//       },
//       {
//         id: '204',
//         handover_id: '2',
//         item_name: 'Microwave',
//         category: 'Electronics',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-009',
//         notes: '20L, convection'
//       }
//     ]
//   },
//   {
//     id: '3',
//     tenant_name: 'Amit Kumar',
//     tenant_phone: '7654321098',
//     tenant_email: 'amit.kumar@email.com',
//     property_name: 'Garden Heights',
//     room_number: '302',
//     move_in_date: '2026-02-15',
//     handover_date: '2026-02-15',
//     inspector_name: 'Vikram Singh',
//     security_deposit: 18000,
//     rent_amount: 9000,
//     notes: 'Handover pending item verification.',
//     status: 'Pending',
//     handover_items: [
//       {
//         id: '301',
//         handover_id: '3',
//         item_name: 'Single Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         asset_id: 'AST-010',
//         notes: 'Standard single bed'
//       },
//       {
//         id: '302',
//         handover_id: '3',
//         item_name: 'Mattress',
//         category: 'Mattress',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         asset_id: 'AST-011',
//         notes: 'Foam mattress'
//       },
//       {
//         id: '303',
//         handover_id: '3',
//         item_name: 'Study Desk',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-012',
//         notes: 'With shelves'
//       }
//     ]
//   },
//   {
//     id: '4',
//     tenant_name: 'Neha Singh',
//     tenant_phone: '6543210987',
//     tenant_email: 'neha.singh@email.com',
//     property_name: 'Lakeview Residency',
//     room_number: '415',
//     bed_number: 'C',
//     move_in_date: '2026-01-20',
//     handover_date: '2026-01-20',
//     inspector_name: 'Rajesh Kumar',
//     security_deposit: 35000,
//     rent_amount: 18000,
//     notes: 'Premium room with all amenities.',
//     status: 'Confirmed',
//     handover_items: [
//       {
//         id: '401',
//         handover_id: '4',
//         item_name: 'King Size Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-013',
//         notes: 'Upholstered headboard'
//       },
//       {
//         id: '402',
//         handover_id: '4',
//         item_name: 'Mattress',
//         category: 'Mattress',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-014',
//         notes: 'Luxury memory foam'
//       },
//       {
//         id: '403',
//         handover_id: '4',
//         item_name: 'Washing Machine',
//         category: 'Electronics',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-015',
//         notes: 'Fully automatic, 6.5kg'
//       },
//       {
//         id: '404',
//         handover_id: '4',
//         item_name: 'TV',
//         category: 'Electronics',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-016',
//         notes: '32" LED TV'
//       },
//       {
//         id: '405',
//         handover_id: '4',
//         item_name: 'Dining Table',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'New',
//         asset_id: 'AST-017',
//         notes: '4-seater with glass top'
//       }
//     ]
//   },
//   {
//     id: '5',
//     tenant_name: 'Vikram Mehta',
//     tenant_phone: '5432109876',
//     tenant_email: 'vikram.mehta@email.com',
//     property_name: 'Sunset Villa',
//     room_number: '203',
//     move_in_date: '2026-02-10',
//     handover_date: '2026-02-10',
//     inspector_name: 'Sanjay Gupta',
//     security_deposit: 22000,
//     rent_amount: 11000,
//     notes: 'Handover completed. Tenant is satisfied.',
//     status: 'Completed',
//     handover_items: [
//       {
//         id: '501',
//         handover_id: '5',
//         item_name: 'Double Bed',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-018',
//         notes: 'Wooden frame'
//       },
//       {
//         id: '502',
//         handover_id: '5',
//         item_name: 'Mattress',
//         category: 'Mattress',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: 'AST-019',
//         notes: 'Spring mattress'
//       },
//       {
//         id: '503',
//         handover_id: '5',
//         item_name: 'Desk',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         asset_id: 'AST-020',
//         notes: 'Small writing desk'
//       },
//       {
//         id: '504',
//         handover_id: '5',
//         item_name: 'Chair',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Used',
//         asset_id: 'AST-021',
//         notes: 'Basic office chair'
//       }
//     ]
//   }
// ];

// export function TenantHandover() {
//   const [handovers, setHandovers] = useState<TenantHandover[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const [editingHandover, setEditingHandover] = useState<TenantHandover | null>(null);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [saving, setSaving] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showShareModal, setShowShareModal] = useState(false);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [selectedHandover, setSelectedHandover] = useState<TenantHandover | null>(null);
//   const [otpCode, setOtpCode] = useState('');
//   const [generatedOTP, setGeneratedOTP] = useState('');
//   const [statusUpdateData, setStatusUpdateData] = useState({
//     newStatus: '',
//     remarks: ''
//   });
//   const [filters, setFilters] = useState({
//     property: '',
//     status: '',
//     dateFrom: '',
//     dateTo: '',
//     tenantName: '',
//     roomNumber: ''
//   });

//   const [formData, setFormData] = useState({
//     tenant_name: '',
//     tenant_phone: '',
//     tenant_email: '',
//     property_name: '',
//     room_number: '',
//     bed_number: '',
//     move_in_date: new Date().toISOString().split('T')[0],
//     handover_date: new Date().toISOString().split('T')[0],
//     inspector_name: '',
//     security_deposit: 0,
//     rent_amount: 0,
//     notes: '',
//     status: 'Active'
//   });

//   const [items, setItems] = useState<HandoverItem[]>([
//     {
//       item_name: '',
//       category: 'Furniture',
//       quantity: 1,
//       condition_at_movein: 'Good',
//       asset_id: '',
//       notes: ''
//     }
//   ]);

//   useEffect(() => {
//     loadHandovers();
//   }, []);

//   const filteredHandovers = useMemo(() => {
//     return handovers.filter(handover => {
//       if (filters.property && !handover.property_name.toLowerCase().includes(filters.property.toLowerCase())) {
//         return false;
//       }
//       if (filters.status && handover.status !== filters.status) {
//         return false;
//       }
//       if (filters.tenantName && !handover.tenant_name.toLowerCase().includes(filters.tenantName.toLowerCase())) {
//         return false;
//       }
//       if (filters.roomNumber && !handover.room_number.toLowerCase().includes(filters.roomNumber.toLowerCase())) {
//         return false;
//       }
//       if (filters.dateFrom && new Date(handover.handover_date) < new Date(filters.dateFrom)) {
//         return false;
//       }
//       if (filters.dateTo && new Date(handover.handover_date) > new Date(filters.dateTo)) {
//         return false;
//       }
//       return true;
//     });
//   }, [handovers, filters]);

//   const clearFilters = () => {
//     setFilters({
//       property: '',
//       status: '',
//       dateFrom: '',
//       dateTo: '',
//       tenantName: '',
//       roomNumber: ''
//     });
//   };

//   const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

//   const loadHandovers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 800));
//       setHandovers(staticHandovers);
//     } catch (err: any) {
//       setError(err.message || 'Failed to load tenant handovers');
//       console.error('Error loading tenant handovers:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdd = () => {
//     resetForm();
//     setEditingHandover(null);
//     setCurrentStep(1);
//     setShowModal(true);
//   };

//   const handleEdit = async (handover: TenantHandover) => {
//     try {
//       setEditingHandover(handover);
//       setFormData({
//         tenant_name: handover.tenant_name || '',
//         tenant_phone: handover.tenant_phone || '',
//         tenant_email: handover.tenant_email || '',
//         property_name: handover.property_name || '',
//         room_number: handover.room_number || '',
//         bed_number: handover.bed_number || '',
//         move_in_date: handover.move_in_date || new Date().toISOString().split('T')[0],
//         handover_date: handover.handover_date || new Date().toISOString().split('T')[0],
//         inspector_name: handover.inspector_name || '',
//         security_deposit: handover.security_deposit || 0,
//         rent_amount: handover.rent_amount || 0,
//         notes: handover.notes || '',
//         status: handover.status || 'Active'
//       });

//       // Load handover items
//       const handoverItems = handover.handover_items || [];
//       if (handoverItems.length > 0) {
//         setItems(handoverItems);
//       }

//       setCurrentStep(1);
//       setShowModal(true);
//     } catch (err: any) {
//       alert('Failed to load handover details: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleDelete = async (handover: TenantHandover) => {
//     if (!confirm('Delete this handover record permanently? This will also delete all associated items.')) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 400));
//       setHandovers(prev => prev.filter(h => h.id !== handover.id));
//     } catch (err: any) {
//       alert('Failed to delete handover: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleOpenStatusModal = (handover: TenantHandover) => {
//     setSelectedHandover(handover);
//     setStatusUpdateData({
//       newStatus: handover.status,
//       remarks: ''
//     });
//     setShowStatusModal(true);
//   };

//   const handleUpdateStatus = async () => {
//     if (!selectedHandover) return;

//     if (!statusUpdateData.newStatus) {
//       alert('Please select a status');
//       return;
//     }

//     try {
//       setSaving(true);
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 500));

//       setHandovers(prev => prev.map(h => {
//         if (h.id === selectedHandover.id) {
//           return {
//             ...h,
//             status: statusUpdateData.newStatus,
//             notes: h.notes
//               ? `${h.notes}\n\n[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
//               : `[Status Update - ${new Date().toLocaleString()}]\nStatus: ${statusUpdateData.newStatus}\nRemarks: ${statusUpdateData.remarks || 'N/A'}`
//           };
//         }
//         return h;
//       }));

//       setShowStatusModal(false);
//       setSelectedHandover(null);
//       setStatusUpdateData({ newStatus: '', remarks: '' });
//       alert('Status updated successfully!');
//     } catch (err: any) {
//       alert('Failed to update status: ' + (err.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleBulkDelete = async (handoversToDelete: TenantHandover[]) => {
//     if (!confirm(`Delete ${handoversToDelete.length} handover records permanently?`)) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 600));
//       const idsToDelete = new Set(handoversToDelete.map(h => h.id));
//       setHandovers(prev => prev.filter(h => !idsToDelete.has(h.id)));
//     } catch (err: any) {
//       alert('Failed to delete handovers: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleViewHandover = async (handover: TenantHandover) => {
//     try {
//       const fullHandover = handover;
//       setSelectedHandover(fullHandover);
//       setShowViewModal(true);
//     } catch (err: any) {
//       alert('Failed to load handover details: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleShareHandover = (handover: TenantHandover) => {
//     setSelectedHandover(handover);
//     setShowShareModal(true);
//   };

//   const handleInitiateOTP = (handover: TenantHandover) => {
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     setGeneratedOTP(otp);
//     setSelectedHandover(handover);
//     setOtpCode('');
//     setShowOTPModal(true);
//     alert(`OTP sent to ${handover.tenant_phone}: ${otp}\n\n(In production, this would be sent via SMS)`);
//   };

//   const handleVerifyOTP = async () => {
//     if (otpCode !== generatedOTP) {
//       alert('Invalid OTP. Please try again.');
//       return;
//     }

//     if (!selectedHandover) return;

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 300));

//       setHandovers(prev => prev.map(h => {
//         if (h.id === selectedHandover.id) {
//           return { ...h, status: 'Confirmed' };
//         }
//         return h;
//       }));

//       alert('Handover confirmed successfully via OTP!');
//       setShowOTPModal(false);
//       setOtpCode('');
//       setGeneratedOTP('');
//       setSelectedHandover(null);
//     } catch (err: any) {
//       alert('Failed to update handover status: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const copyShareLink = () => {
//     if (!selectedHandover) return;
//     const link = `${window.location.origin}/handover/${selectedHandover.id}`;
//     navigator.clipboard.writeText(link);
//     alert('Handover link copied to clipboard!');
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleShareWhatsApp = () => {
//     if (!selectedHandover) return;

//     try {
//       const phoneNumber = selectedHandover.tenant_phone.replace(/\D/g, '');

//       if (!phoneNumber) {
//         alert('Phone number is missing or invalid!');
//         return;
//       }

//       const message = encodeURIComponent(
//         `🏠 TENANT HANDOVER DOCUMENT\n\n` +
//         `Tenant: ${selectedHandover.tenant_name}\n` +
//         `Property: ${selectedHandover.property_name}\n` +
//         `Room: ${selectedHandover.room_number}\n` +
//         `Move-in Date: ${dateFormatter(selectedHandover.move_in_date)}\n` +
//         `Security Deposit: ${currencyFormatter.format(selectedHandover.security_deposit)}\n\n` +
//         `Items Handed Over: ${selectedHandover.handover_items?.length || 0} items\n\n` +
//         `View full details: ${window.location.origin}/handover/${selectedHandover.id}`
//       );

//       const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
//       const opened = window.open(whatsappUrl, '_blank');

//       if (!opened) {
//         alert('Please allow pop-ups to share via WhatsApp');
//       }
//     } catch (err: any) {
//       console.error('WhatsApp share error:', err);
//       alert('Failed to share via WhatsApp: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const handleDownloadPDF = () => {
//     if (!selectedHandover) return;

//     try {
//       const doc = new jsPDF({
//         orientation: 'portrait',
//         unit: 'mm',
//         format: 'a4'
//       });

//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();
//       const margin = 15;
//       const contentWidth = pageWidth - 2 * margin;
//       let yPos = margin;

//       doc.setFontSize(20);
//       doc.setFont('helvetica', 'bold');
//       doc.text('TENANT HANDOVER DOCUMENT', pageWidth / 2, yPos, { align: 'center' });

//       yPos += 10;
//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       doc.text(`Document ID: ${selectedHandover.id.substring(0, 8).toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });

//       yPos += 10;
//       doc.setLineWidth(0.5);
//       doc.line(margin, yPos, pageWidth - margin, yPos);
//       yPos += 8;

//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Tenant Information', margin, yPos);
//       yPos += 6;

//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       const tenantInfo = [
//         ['Tenant Name:', selectedHandover.tenant_name],
//         ['Phone:', selectedHandover.tenant_phone],
//         ['Email:', selectedHandover.tenant_email || 'N/A'],
//         ['Property:', selectedHandover.property_name],
//         ['Room Number:', selectedHandover.room_number],
//         ['Bed Number:', selectedHandover.bed_number || 'N/A'],
//       ];

//       tenantInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(label, margin, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(value, margin + 40, yPos);
//         yPos += 6;
//       });

//       yPos += 4;
//       doc.setFontSize(14);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Handover Details', margin, yPos);
//       yPos += 6;

//       doc.setFontSize(10);
//       doc.setFont('helvetica', 'normal');
//       const handoverInfo = [
//         ['Move-in Date:', dateFormatter(selectedHandover.move_in_date)],
//         ['Handover Date:', dateFormatter(selectedHandover.handover_date)],
//         ['Inspector:', selectedHandover.inspector_name],
//         ['Security Deposit:', currencyFormatter.format(selectedHandover.security_deposit)],
//         ['Rent Amount:', currencyFormatter.format(selectedHandover.rent_amount)],
//         ['Status:', selectedHandover.status],
//       ];

//       handoverInfo.forEach(([label, value]) => {
//         doc.setFont('helvetica', 'bold');
//         doc.text(label, margin, yPos);
//         doc.setFont('helvetica', 'normal');
//         doc.text(value, margin + 40, yPos);
//         yPos += 6;
//       });

//       if (selectedHandover.handover_items && selectedHandover.handover_items.length > 0) {
//         yPos += 4;

//         if (yPos > pageHeight - 60) {
//           doc.addPage();
//           yPos = margin;
//         }

//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text(`Item Checklist (${selectedHandover.handover_items.length} Items)`, margin, yPos);
//         yPos += 8;

//         const tableData = selectedHandover.handover_items.map((item, idx) => [
//           (idx + 1).toString(),
//           item.item_name,
//           item.category,
//           item.quantity.toString(),
//           item.condition_at_movein,
//           item.notes || '-'
//         ]);

//         autoTable(doc, {
//           startY: yPos,
//           head: [['#', 'Item Name', 'Category', 'Qty', 'Condition', 'Notes']],
//           body: tableData,
//           theme: 'grid',
//           headStyles: {
//             fillColor: [37, 99, 235],
//             textColor: 255,
//             fontStyle: 'bold',
//             fontSize: 10,
//             halign: 'center'
//           },
//           bodyStyles: {
//             fontSize: 9,
//             cellPadding: 3
//           },
//           columnStyles: {
//             0: { halign: 'center', cellWidth: 10 },
//             1: { cellWidth: 40 },
//             2: { halign: 'center', cellWidth: 25 },
//             3: { halign: 'center', cellWidth: 15 },
//             4: { halign: 'center', cellWidth: 25 },
//             5: { cellWidth: 'auto' }
//           },
//           alternateRowStyles: {
//             fillColor: [245, 247, 250]
//           },
//           margin: { left: margin, right: margin },
//         });

//         yPos = (doc as any).lastAutoTable.finalY + 10;
//       }

//       if (selectedHandover.notes) {
//         if (yPos > pageHeight - 40) {
//           doc.addPage();
//           yPos = margin;
//         }

//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Additional Notes:', margin, yPos);
//         yPos += 6;

//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         const notesLines = doc.splitTextToSize(selectedHandover.notes, contentWidth);
//         doc.text(notesLines, margin, yPos);
//         yPos += notesLines.length * 5 + 10;
//       }

//       if (yPos > pageHeight - 80) {
//         doc.addPage();
//         yPos = margin;
//       }

//       yPos += 10;
//       doc.setLineWidth(0.5);
//       doc.line(margin, yPos, pageWidth - margin, yPos);
//       yPos += 10;

//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Signatures', margin, yPos);
//       yPos += 10;

//       const signatureWidth = (contentWidth - 20) / 3;
//       const signatureY = yPos;

//       const signatures = [
//         { name: selectedHandover.tenant_name, label: 'Tenant Signature', date: dateFormatter(selectedHandover.handover_date) },
//         { name: selectedHandover.inspector_name, label: 'Inspector/Manager', date: dateFormatter(selectedHandover.handover_date) },
//         { name: 'Witness', label: 'Witness Signature', date: '__________' }
//       ];

//       signatures.forEach((sig, idx) => {
//         const xPos = margin + idx * (signatureWidth + 10);

//         doc.setLineWidth(0.3);
//         doc.line(xPos, signatureY + 15, xPos + signatureWidth, signatureY + 15);

//         doc.setFontSize(9);
//         doc.setFont('helvetica', 'bold');
//         doc.text(sig.name, xPos + signatureWidth / 2, signatureY + 20, { align: 'center' });

//         doc.setFont('helvetica', 'normal');
//         doc.setFontSize(8);
//         doc.text(sig.label, xPos + signatureWidth / 2, signatureY + 25, { align: 'center' });
//         doc.text(`Date: ${sig.date}`, xPos + signatureWidth / 2, signatureY + 30, { align: 'center' });
//       });

//       yPos = signatureY + 40;

//       if (yPos > pageHeight - 30) {
//         doc.addPage();
//         yPos = margin;
//       }

//       doc.setFillColor(239, 246, 255);
//       doc.rect(margin, yPos, contentWidth, 20, 'F');
//       doc.setFontSize(8);
//       doc.setFont('helvetica', 'normal');
//       const disclaimer = 'This is an official handover document. By signing, both parties acknowledge the accuracy of the information above.';
//       const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 10);
//       doc.text(disclaimerLines, pageWidth / 2, yPos + 6, { align: 'center' });
//       doc.setFont('helvetica', 'bold');
//       doc.text(`Status: ${selectedHandover.status}`, pageWidth / 2, yPos + 15, { align: 'center' });

//       const totalPages = (doc as any).internal.pages.length - 1;
//       for (let i = 1; i <= totalPages; i++) {
//         doc.setPage(i);
//         doc.setFontSize(8);
//         doc.setFont('helvetica', 'normal');
//         doc.text(
//           `Page ${i} of ${totalPages}`,
//           pageWidth / 2,
//           pageHeight - 10,
//           { align: 'center' }
//         );
//         doc.text(
//           `Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`,
//           pageWidth - margin,
//           pageHeight - 10,
//           { align: 'right' }
//         );
//       }

//       const fileName = `Handover_${selectedHandover.tenant_name.replace(/\s+/g, '_')}_${selectedHandover.property_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
//       doc.save(fileName);
//       console.log('PDF generated successfully:', fileName);
//     } catch (err: any) {
//       console.error('PDF generation error:', err);
//       alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
//     }
//   };

//   const validateStep1 = () => {
//     if (!formData.tenant_name.trim()) {
//       alert('Please enter tenant name');
//       return false;
//     }
//     if (!formData.tenant_phone.trim()) {
//       alert('Please enter tenant phone');
//       return false;
//     }
//     if (!formData.property_name.trim()) {
//       alert('Please enter property name');
//       return false;
//     }
//     if (!formData.room_number.trim()) {
//       alert('Please enter room number');
//       return false;
//     }
//     if (!formData.move_in_date) {
//       alert('Please select move-in date');
//       return false;
//     }
//     if (!formData.handover_date) {
//       alert('Please select handover date');
//       return false;
//     }
//     if (!formData.inspector_name.trim()) {
//       alert('Please enter inspector name');
//       return false;
//     }
//     if (formData.security_deposit < 0) {
//       alert('Security deposit cannot be negative');
//       return false;
//     }
//     if (formData.rent_amount < 0) {
//       alert('Rent amount cannot be negative');
//       return false;
//     }
//     return true;
//   };

//   const validateStep2 = () => {
//     if (items.length === 0) {
//       alert('Please add at least one item');
//       return false;
//     }
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       if (!item.item_name.trim()) {
//         alert(`Please enter name for item ${i + 1}`);
//         return false;
//       }
//       if (item.quantity <= 0) {
//         alert(`Quantity for item ${i + 1} must be greater than 0`);
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

//       if (editingHandover) {
//         // Update existing handover
//         const updatedHandover: TenantHandover = {
//           ...editingHandover,
//           ...formData,
//           handover_items: items
//         };
//         setHandovers(prev => prev.map(h => h.id === editingHandover.id ? updatedHandover : h));
//       } else {
//         // Create new handover
//         const newHandover: TenantHandover = {
//           id: `${Date.now()}`,
//           ...formData,
//           handover_items: items
//         };
//         setHandovers(prev => [newHandover, ...prev]);
//       }

//       setShowModal(false);
//       setEditingHandover(null);
//       resetForm();
//       alert(`Handover ${editingHandover ? 'updated' : 'created'} successfully with ${items.length} items!`);
//     } catch (err: any) {
//       alert('Failed to save handover: ' + (err.message || 'Unknown error'));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       tenant_name: '',
//       tenant_phone: '',
//       tenant_email: '',
//       property_name: '',
//       room_number: '',
//       bed_number: '',
//       move_in_date: new Date().toISOString().split('T')[0],
//       handover_date: new Date().toISOString().split('T')[0],
//       inspector_name: '',
//       security_deposit: 0,
//       rent_amount: 0,
//       notes: '',
//       status: 'Active'
//     });
//     setItems([
//       {
//         item_name: '',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: '',
//         notes: ''
//       }
//     ]);
//   };

//   const addItem = () => {
//     setItems([
//       ...items,
//       {
//         item_name: '',
//         category: 'Furniture',
//         quantity: 1,
//         condition_at_movein: 'Good',
//         asset_id: '',
//         notes: ''
//       }
//     ]);
//   };

//   const removeItem = (index: number) => {
//     if (items.length === 1) {
//       alert('At least one item is required');
//       return;
//     }
//     setItems(items.filter((_, i) => i !== index));
//   };

//   const updateItem = (index: number, field: keyof HandoverItem, value: any) => {
//     const newItems = [...items];
//     newItems[index] = { ...newItems[index], [field]: value };
//     setItems(newItems);
//   };

//   const getStatusBadgeClass = (status: string) => {
//     switch (status) {
//       case 'Confirmed':
//         return 'bg-emerald-100 text-emerald-700 border border-emerald-300';
//       case 'Active':
//         return 'bg-blue-100 text-blue-700 border border-blue-300';
//       case 'Completed':
//         return 'bg-green-100 text-green-700 border border-green-300';
//       case 'Pending':
//         return 'bg-amber-100 text-amber-700 border border-amber-300';
//       case 'Cancelled':
//         return 'bg-red-100 text-red-700 border border-red-300';
//       default:
//         return 'bg-gray-100 text-gray-700 border border-gray-300';
//     }
//   };

//   const renderActions = (handover: TenantHandover) => (
//     <div className="flex gap-2 flex-wrap">
//       <button
//         onClick={() => handleViewHandover(handover)}
//         className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors shadow-sm hover:shadow"
//         title="View Handover Details"
//       >
//         <Eye className="w-4 h-4" />
//         View
//       </button>
//       <button
//         onClick={() => handleEdit(handover)}
//         className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-bold hover:bg-amber-200 transition-colors shadow-sm hover:shadow"
//         title="Edit Handover"
//       >
//         <Edit className="w-4 h-4" />
//         Edit
//       </button>
//       <button
//         onClick={() => handleDelete(handover)}
//         className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors shadow-sm hover:shadow"
//         title="Delete Handover"
//       >
//         <Trash className="w-4 h-4" />
//         Delete
//       </button>
//     </div>
//   );

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
//       key: 'bed_number',
//       label: 'Bed',
//       sortable: true,
//       searchable: true,
//       render: (row: TenantHandover) => row.bed_number || 'N/A'
//     },
//     {
//       key: 'move_in_date',
//       label: 'Move-In Date',
//       sortable: true,
//       render: (row: TenantHandover) => dateFormatter(row.move_in_date)
//     },
//     {
//       key: 'handover_date',
//       label: 'Handover Date',
//       sortable: true,
//       render: (row: TenantHandover) => dateFormatter(row.handover_date)
//     },
//     {
//       key: 'security_deposit',
//       label: 'Security Deposit',
//       sortable: true,
//       render: (row: TenantHandover) => (
//         <span className="font-bold text-green-700">{currencyFormatter.format(row.security_deposit || 0)}</span>
//       )
//     },
//     {
//       key: 'handover_items',
//       label: 'Items Count',
//       sortable: false,
//       render: (row: TenantHandover) => (
//         <div className="flex items-center justify-center">
//           <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold border border-blue-300">
//             {row.handover_items?.length || 0} items
//           </span>
//         </div>
//       )
//     },
//     {
//       key: 'status',
//       label: 'Status',
//       sortable: true,
//       render: (row: TenantHandover) => (
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
//       render: (row: TenantHandover) => renderActions(row)
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
//             onClick={loadHandovers}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full print:hidden">
//       <div className="mb-6 print:hidden bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
//         <div className="flex items-center justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg">
//               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <div>
//               <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//                 Tenant Handover
//               </h1>
//               <p className="text-gray-600 font-semibold mt-1">Manage move-in handovers with item checklist</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowFilterModal(true)}
//             className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
//           >
//             <Filter className="w-5 h-5" />
//             Advanced Filters
//             {activeFiltersCount > 0 && (
//               <span className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-white text-blue-600 rounded-full text-xs font-black">
//                 {activeFiltersCount}
//               </span>
//             )}
//           </button>
//         </div>
//       </div>

//       <div className="print:hidden">
//         {activeFiltersCount > 0 && (
//           <div className="mb-4 flex items-center gap-3 flex-wrap">
//             <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
//               <Filter className="w-4 h-4 text-blue-600" />
//               <span className="text-sm font-bold text-blue-700">
//                 {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
//               </span>
//             </div>
//             {filters.tenantName && (
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
//                 <span className="text-sm text-gray-600">Tenant:</span>
//                 <span className="text-sm font-bold text-gray-900">{filters.tenantName}</span>
//               </div>
//             )}
//             {filters.property && (
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
//                 <span className="text-sm text-gray-600">Property:</span>
//                 <span className="text-sm font-bold text-gray-900">{filters.property}</span>
//               </div>
//             )}
//             {filters.roomNumber && (
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
//                 <span className="text-sm text-gray-600">Room:</span>
//                 <span className="text-sm font-bold text-gray-900">{filters.roomNumber}</span>
//               </div>
//             )}
//             {filters.status && (
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
//                 <span className="text-sm text-gray-600">Status:</span>
//                 <span className={`text-sm font-bold px-2 py-0.5 rounded ${getStatusBadgeClass(filters.status)}`}>
//                   {filters.status}
//                 </span>
//               </div>
//             )}
//             {(filters.dateFrom || filters.dateTo) && (
//               <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg shadow-sm">
//                 <span className="text-sm text-gray-600">Date:</span>
//                 <span className="text-sm font-bold text-gray-900">
//                   {filters.dateFrom ? dateFormatter(filters.dateFrom) : 'Any'} → {filters.dateTo ? dateFormatter(filters.dateTo) : 'Any'}
//                 </span>
//               </div>
//             )}
//             <button
//               onClick={clearFilters}
//               className="flex items-center gap-1 px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//             >
//               <X className="w-4 h-4" />
//               Clear All
//             </button>
//           </div>
//         )}
//         <DataTable
//           data={filteredHandovers}
//           columns={columns}
//           onAdd={handleAdd}
//           onExport={() => { }}
//           title="Tenant Handovers"
//           addButtonText="Add Handover"
//           rowKey="id"
//           enableBulkActions={true}
//           onBulkDelete={handleBulkDelete}
//           hideFilters={true}
//         />
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto print:hidden">
//           <div className="bg-white rounded-xl w-full max-w-4xl my-8 max-h-[90vh] overflow-y-auto print:hidden">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-gray-900">
//                     {editingHandover ? 'Edit Handover' : 'New Handover'}
//                   </h2>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Step {currentStep} of 2 - {currentStep === 1 ? 'Tenant & Property Details' : 'Items Checklist'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => { setShowModal(false); setEditingHandover(null); }}
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
//                   <span className="text-sm font-bold">Details</span>
//                 </div>
//                 <ChevronRight className="w-4 h-4 text-gray-400" />
//                 <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentStep === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
//                   }`}>
//                   <div className={`w-5 h-5 rounded-full ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-white'
//                     } flex items-center justify-center text-xs font-bold`}>2</div>
//                   <span className="text-sm font-bold">Items</span>
//                 </div>
//               </div>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6">
//               {currentStep === 1 && (
//                 <div className="space-y-4">
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Tenant Name <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.tenant_name}
//                         onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Tenant Phone <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="tel"
//                         required
//                         value={formData.tenant_phone}
//                         onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Email</label>
//                     <input
//                       type="email"
//                       value={formData.tenant_email}
//                       onChange={(e) => setFormData({ ...formData, tenant_email: e.target.value })}
//                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                     />
//                   </div>

//                   <div className="grid md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Property Name <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.property_name}
//                         onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Room Number <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         required
//                         value={formData.room_number}
//                         onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">Bed Number</label>
//                       <input
//                         type="text"
//                         value={formData.bed_number}
//                         onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Move-in Date <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={formData.move_in_date}
//                         onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Handover Date <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="date"
//                         required
//                         value={formData.handover_date}
//                         onChange={(e) => setFormData({ ...formData, handover_date: e.target.value })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-1">
//                       Inspector Name <span className="text-red-600">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.inspector_name}
//                       onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
//                       className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                     />
//                   </div>

//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Security Deposit <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         required
//                         min="0"
//                         step="0.01"
//                         value={formData.security_deposit}
//                         onChange={(e) => setFormData({ ...formData, security_deposit: Number(e.target.value) })}
//                         className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-bold text-gray-700 mb-1">
//                         Rent Amount <span className="text-red-600">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         required
//                         min="0"
//                         step="0.01"
//                         value={formData.rent_amount}
//                         onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
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
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
//                     <p className="text-sm text-blue-800 font-semibold">
//                       Add all items being handed over to the tenant. You must add at least one item.
//                     </p>
//                   </div>

//                   {items.map((item, index) => (
//                     <div key={index} className="border-2 border-gray-200 rounded-lg p-4 relative">
//                       <div className="absolute top-2 right-2">
//                         <button
//                           type="button"
//                           onClick={() => removeItem(index)}
//                           className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>

//                       <div className="font-bold text-gray-700 mb-3">Item {index + 1}</div>

//                       <div className="grid md:grid-cols-2 gap-3">
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-1">
//                             Item Name <span className="text-red-600">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             required
//                             value={item.item_name}
//                             onChange={(e) => updateItem(index, 'item_name', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-1">
//                             Category <span className="text-red-600">*</span>
//                           </label>
//                           <select
//                             required
//                             value={item.category}
//                             onChange={(e) => updateItem(index, 'category', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           >
//                             {CATEGORIES.map(cat => (
//                               <option key={cat} value={cat}>{cat}</option>
//                             ))}
//                           </select>
//                         </div>
//                       </div>

//                       <div className="grid md:grid-cols-3 gap-3 mt-3">
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-1">
//                             Quantity <span className="text-red-600">*</span>
//                           </label>
//                           <input
//                             type="number"
//                             required
//                             min="1"
//                             value={item.quantity}
//                             onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-1">
//                             Condition at Move-in <span className="text-red-600">*</span>
//                           </label>
//                           <select
//                             required
//                             value={item.condition_at_movein}
//                             onChange={(e) => updateItem(index, 'condition_at_movein', e.target.value)}
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           >
//                             {CONDITIONS.map(cond => (
//                               <option key={cond} value={cond}>{cond}</option>
//                             ))}
//                           </select>
//                         </div>
//                         <div>
//                           <label className="block text-sm font-bold text-gray-700 mb-1">Asset ID</label>
//                           <input
//                             type="text"
//                             value={item.asset_id || ''}
//                             onChange={(e) => updateItem(index, 'asset_id', e.target.value)}
//                             placeholder="Optional"
//                             className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                           />
//                         </div>
//                       </div>

//                       <div className="mt-3">
//                         <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
//                         <textarea
//                           value={item.notes || ''}
//                           onChange={(e) => updateItem(index, 'notes', e.target.value)}
//                           rows={2}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   ))}

//                   <button
//                     type="button"
//                     onClick={addItem}
//                     className="w-full py-3 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
//                   >
//                     <Plus className="w-5 h-5" />
//                     Add Item
//                   </button>
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
//                         {editingHandover ? 'Update' : 'Create'} Handover
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showViewModal && selectedHandover && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)} data-print-modal>
//           <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
//               <div className="flex items-center justify-between mb-3">
//                 <div>
//                   <h2 className="text-2xl font-black text-gray-900">Tenant Handover Document</h2>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Document ID: <span className="font-mono font-bold text-blue-600">{selectedHandover.id.substring(0, 8).toUpperCase()}</span>
//                   </p>
//                 </div>
//                 <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-gray-100 rounded-lg no-print">
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="flex flex-wrap gap-2 print:hidden">
//                 <button
//                   onClick={handleDownloadPDF}
//                   className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <FileDown className="w-4 h-4" />
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
//                   onClick={handlePrint}
//                   className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
//                 >
//                   <Printer className="w-4 h-4" />
//                   Print Page
//                 </button>
//                 {selectedHandover.status !== 'Confirmed' && (
//                   <button
//                     onClick={() => {
//                       setShowViewModal(false);
//                       handleInitiateOTP(selectedHandover);
//                     }}
//                     className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
//                   >
//                     <ShieldCheck className="w-4 h-4" />
//                     Verify with OTP
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Tenant Name</div>
//                   <div className="font-bold text-gray-900">{selectedHandover.tenant_name}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Phone</div>
//                   <div className="font-bold text-gray-900">{selectedHandover.tenant_phone}</div>
//                 </div>
//                 {selectedHandover.tenant_email && (
//                   <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
//                     <div className="text-sm text-gray-600 mb-1">Email</div>
//                     <div className="font-bold text-gray-900">{selectedHandover.tenant_email}</div>
//                   </div>
//                 )}
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Property</div>
//                   <div className="font-bold text-gray-900">{selectedHandover.property_name}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Room / Bed</div>
//                   <div className="font-bold text-gray-900">
//                     {selectedHandover.room_number} {selectedHandover.bed_number ? `/ ${selectedHandover.bed_number}` : ''}
//                   </div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Move-in Date</div>
//                   <div className="font-bold text-gray-900">{dateFormatter(selectedHandover.move_in_date)}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Handover Date</div>
//                   <div className="font-bold text-gray-900">{dateFormatter(selectedHandover.handover_date)}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Inspector Name</div>
//                   <div className="font-bold text-gray-900">{selectedHandover.inspector_name}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Status</div>
//                   <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeClass(selectedHandover.status)}`}>
//                     {selectedHandover.status}
//                   </span>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Security Deposit</div>
//                   <div className="font-bold text-gray-900">{currencyFormatter.format(selectedHandover.security_deposit)}</div>
//                 </div>
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <div className="text-sm text-gray-600 mb-1">Rent Amount</div>
//                   <div className="font-bold text-gray-900">{currencyFormatter.format(selectedHandover.rent_amount)}</div>
//                 </div>
//               </div>

//               {selectedHandover.handover_items && selectedHandover.handover_items.length > 0 && (
//                 <div>
//                   <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center justify-between">
//                     <span>Item Checklist</span>
//                     <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                       {selectedHandover.handover_items.length} Items
//                     </span>
//                   </h3>
//                   <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
//                     <table className="w-full border-collapse">
//                       <thead>
//                         <tr className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">#</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Item Name</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold border-r border-blue-500">Category</th>
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Quantity</th>
//                           <th className="px-4 py-3 text-center text-sm font-bold border-r border-blue-500">Condition</th>
//                           <th className="px-4 py-3 text-left text-sm font-bold">Notes</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {selectedHandover.handover_items.map((item, idx) => (
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
//                               <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.condition_at_movein === 'New' ? 'bg-green-100 text-green-800' :
//                                 item.condition_at_movein === 'Good' ? 'bg-blue-100 text-blue-800' :
//                                   item.condition_at_movein === 'Used' ? 'bg-yellow-100 text-yellow-800' :
//                                     'bg-orange-100 text-orange-800'
//                                 }`}>
//                                 {item.condition_at_movein}
//                               </span>
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

//               {selectedHandover.notes && (
//                 <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
//                   <h3 className="text-sm font-black text-amber-900 mb-2">Additional Notes</h3>
//                   <p className="text-sm text-amber-800">{selectedHandover.notes}</p>
//                 </div>
//               )}

//               <div className="border-t-2 border-gray-300 pt-6 mt-8">
//                 <div className="grid md:grid-cols-3 gap-6">
//                   <div className="text-center">
//                     <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
//                     <div className="font-bold text-gray-900">{selectedHandover.tenant_name}</div>
//                     <div className="text-sm text-gray-600">Tenant Signature</div>
//                     <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(selectedHandover.handover_date)}</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="border-b-2 border-gray-400 mb-2 pb-12"></div>
//                     <div className="font-bold text-gray-900">{selectedHandover.inspector_name}</div>
//                     <div className="text-sm text-gray-600">Inspector/Manager Signature</div>
//                     <div className="text-xs text-gray-500 mt-1">Date: {dateFormatter(selectedHandover.handover_date)}</div>
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
//                   This is an official handover document. By signing, both parties acknowledge the accuracy of the information above.
//                 </div>
//                 <div className="text-xs text-blue-700 mt-2">
//                   Status: <span className={`font-bold ${selectedHandover.status === 'Confirmed' ? 'text-green-700' : 'text-amber-700'}`}>
//                     {selectedHandover.status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showShareModal && selectedHandover && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowShareModal(false)}>
//           <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
//             <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-black text-gray-900">Share Handover</h2>
//               <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Tenant Name</label>
//                 <div className="text-gray-900">{selectedHandover.tenant_name}</div>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Share Link</label>
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     readOnly
//                     value={`${window.location.origin}/handover/${selectedHandover.id}`}
//                     className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
//                   />
//                   <button
//                     onClick={copyShareLink}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
//                   >
//                     Copy
//                   </button>
//                 </div>
//               </div>

//               <div className="pt-4 border-t border-gray-200">
//                 <p className="text-sm text-gray-600">
//                   Share this link with the tenant to view their handover details and item checklist.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showOTPModal && selectedHandover && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden" onClick={() => setShowOTPModal(false)}>
//           <div className="bg-white rounded-xl w-full max-w-md print:hidden" onClick={(e) => e.stopPropagation()}>
//             <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
//               <h2 className="text-2xl font-black text-gray-900">Verify OTP</h2>
//               <button onClick={() => setShowOTPModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
//                   <div>
//                     <div className="font-bold text-blue-900 text-sm">OTP Sent</div>
//                     <div className="text-sm text-blue-700 mt-1">
//                       A 6-digit OTP has been sent to {selectedHandover.tenant_phone}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Tenant Name</label>
//                 <div className="text-gray-900">{selectedHandover.tenant_name}</div>
//               </div>

//               <div>
//                 <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP *</label>
//                 <input
//                   type="text"
//                   maxLength={6}
//                   value={otpCode}
//                   onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
//                   placeholder="Enter 6-digit OTP"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-bold tracking-widest"
//                 />
//               </div>

//               <button
//                 onClick={handleVerifyOTP}
//                 disabled={otpCode.length !== 6}
//                 className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
//               >
//                 Verify & Confirm Handover
//               </button>

//               <div className="text-center">
//                 <button
//                   onClick={() => handleInitiateOTP(selectedHandover)}
//                   className="text-sm text-blue-600 hover:text-blue-700 font-bold"
//                 >
//                   Resend OTP
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {showStatusModal && selectedHandover && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowStatusModal(false)}>
//           <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
//             <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">Update Status</h2>
//                   <p className="text-sm text-emerald-100 mt-1">Approve and change handover status</p>
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
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.tenant_name}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Property:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.property_name}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Room:</span>
//                     <p className="font-bold text-gray-900 mt-0.5">{selectedHandover.room_number}</p>
//                   </div>
//                   <div>
//                     <span className="text-gray-600">Current Status:</span>
//                     <p className="mt-0.5">
//                       <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(selectedHandover.status)}`}>
//                         {selectedHandover.status}
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
//                   <option value="Active">Active</option>
//                   <option value="Completed">Completed</option>
//                   <option value="Confirmed">Confirmed</option>
//                   <option value="Pending">Pending</option>
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
//                   This will be added to the handover notes with timestamp.
//                 </p>
//               </div>

//               {statusUpdateData.newStatus !== selectedHandover.status && (
//                 <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
//                   <div className="flex items-start gap-3">
//                     <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                       <span className="text-white text-xs font-bold">!</span>
//                     </div>
//                     <div>
//                       <div className="font-bold text-amber-900 text-sm">Status Change</div>
//                       <div className="text-sm text-amber-800 mt-1">
//                         Status will change from <span className="font-bold">{selectedHandover.status}</span> to{' '}
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

//       {showFilterModal && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:hidden backdrop-blur-sm" onClick={() => setShowFilterModal(false)}>
//           <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl print:hidden animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>
//             <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-5 rounded-t-2xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-black text-white">Advanced Filters</h2>
//                   <p className="text-sm text-blue-100 mt-1">Refine your handover search</p>
//                 </div>
//                 <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                   <X className="w-6 h-6 text-white" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6 space-y-5">
//               <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
//                 <h3 className="text-sm font-bold text-gray-900 mb-3">Basic Filters</h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       Tenant Name
//                     </label>
//                     <input
//                       type="text"
//                       value={filters.tenantName}
//                       onChange={(e) => setFilters({ ...filters, tenantName: e.target.value })}
//                       placeholder="Search by tenant name..."
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       Property Name
//                     </label>
//                     <input
//                       type="text"
//                       value={filters.property}
//                       onChange={(e) => setFilters({ ...filters, property: e.target.value })}
//                       placeholder="Search by property..."
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       Room Number
//                     </label>
//                     <input
//                       type="text"
//                       value={filters.roomNumber}
//                       onChange={(e) => setFilters({ ...filters, roomNumber: e.target.value })}
//                       placeholder="Search by room..."
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-bold text-gray-700 mb-2">
//                       Status
//                     </label>
//                     <select
//                       value={filters.status}
//                       onChange={(e) => setFilters({ ...filters, status: e.target.value })}
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     >
//                       <option value="">All Statuses</option>
//                       <option value="Active">Active</option>
//                       <option value="Completed">Completed</option>
//                       <option value="Confirmed">Confirmed</option>
//                       <option value="Pending">Pending</option>
//                       <option value="Cancelled">Cancelled</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
//                 <h3 className="text-sm font-bold text-gray-900 mb-3">Date Range Filter</h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-600 mb-1.5">From Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateFrom}
//                       onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-semibold text-gray-600 mb-1.5">To Date</label>
//                     <input
//                       type="date"
//                       value={filters.dateTo}
//                       onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
//                       className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold focus:outline-none focus:border-blue-500 transition-colors bg-white"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {activeFiltersCount > 0 && (
//                 <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <Filter className="w-5 h-5 text-blue-600" />
//                       <span className="text-sm font-bold text-blue-900">
//                         {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} applied
//                       </span>
//                     </div>
//                     <button
//                       onClick={clearFilters}
//                       className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors"
//                     >
//                       Clear All
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end border-t">
//               <button
//                 onClick={() => setShowFilterModal(false)}
//                 className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={() => setShowFilterModal(false)}
//                 className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
//               >
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// TenantHandover.tsx — Assets-style compact UI
// ✅ Compact form like Assets.tsx
// ✅ Tenant select → auto-fill all fields
// ✅ Table with column search bars
// ✅ Right-side filter drawer
// ✅ Fully responsive
// ✅ Blue gradient header matching Assets

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FileText, Plus, Trash2, Loader2, X, Download,
  Building, IndianRupee, StickyNote, RefreshCw, Filter,
  AlertTriangle, ChevronDown, ChevronUp, User, Calendar,
  ShieldCheck, Eye, MessageCircle, FileDown, Printer, Check,
  ChevronRight, ChevronLeft, Boxes,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
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
import {
  getHandovers,
  createHandover,
  updateHandover,
  deleteHandover,
  getHandoverStats,
  getHandoverById,
} from "@/lib/handoverApi";
import { listProperties } from "@/lib/propertyApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";
// Import change karo — top pe
import { listTenants } from "@/lib/tenantApi";
import Swal from 'sweetalert2';

// ─── Types ────────────────────────────────────────────────────────────────────
interface HandoverItem {
  id?: string;
  item_name: string;
  category: string;
  quantity: number;
  condition_at_movein: string;
  asset_id?: string;
  notes?: string;
}

interface TenantHandover {
  id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_email?: string;
  property_id: string;
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
  created_at?: string;
}

interface TenantOption {
  id: string;
  name: string;
  phone: string;
  email?: string;
  property_id?: string;
  property_name?: string;
  room_number?: string;
  bed_number?: string;
  move_in_date?: string;
  security_deposit?: number;
  rent_amount?: number;
}

type StatusType = 'all' | 'Active' | 'Confirmed' | 'Completed' | 'Pending' | 'Cancelled';

// ─── Style tokens (matches Assets.tsx) ───────────────────────────────────────
const F  = "h-8 text-[11px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[11px] font-semibold text-gray-500 mb-0.5";
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

const ITEM_CATEGORIES = ['Furniture', 'Electronics', 'Mattress', 'Bedding', 'Utensils', 'Appliances', 'Other'];
const CONDITIONS      = ['New', 'Good', 'Used', 'Damaged'];
const STATUSES        = ['Active', 'Confirmed', 'Completed', 'Pending', 'Cancelled'];

const statusColor = (s: string) => {
  switch (s) {
    case 'Confirmed': return 'bg-emerald-100 text-emerald-700';
    case 'Active':    return 'bg-blue-100 text-blue-700';
    case 'Completed': return 'bg-green-100 text-green-700';
    case 'Pending':   return 'bg-amber-100 text-amber-700';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default:          return 'bg-gray-100 text-gray-700';
  }
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN') : 'N/A';
const money = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ═══════════════════════════════════════════════════════════════════════════════
export function TenantHandover() {
  const [handovers,    setHandovers]    = useState<TenantHandover[]>([]);
  const [tenants,      setTenants]      = useState<TenantOption[]>([]);
  const [properties,   setProperties]   = useState<{ id: string; name: string }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [showForm,     setShowForm]     = useState(false);
  const [editingItem,  setEditingItem]  = useState<TenantHandover | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [viewItem,     setViewItem]     = useState<TenantHandover | null>(null);
  const [currentStep,  setCurrentStep]  = useState(1); // 1 = Details, 2 = Items

  // Stats
  const [stats, setStats] = useState({
    total: 0, active: 0, confirmed: 0, pending: 0,
  });

  // Filters
  const [statusFilter,   setStatusFilter]   = useState<StatusType>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Column search
  const [colSearch, setColSearch] = useState({
    tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '',
  });

  // Empty form
  const emptyForm = {
    tenant_id: '', tenant_name: '', tenant_phone: '', tenant_email: '',
    property_id: '', property_name: '', room_number: '', bed_number: '',
    move_in_date: new Date().toISOString().split('T')[0],
    handover_date: new Date().toISOString().split('T')[0],
    inspector_name: '', security_deposit: 0, rent_amount: 0,
    notes: '', status: 'Active',
  };
  const [formData, setFormData] = useState(emptyForm);

  const emptyHandoverItem = (): HandoverItem => ({
    item_name: '', category: 'Furniture', quantity: 1,
    condition_at_movein: 'Good', asset_id: '', notes: '',
  });
  const [handoverItems, setHandoverItems] = useState<HandoverItem[]>([emptyHandoverItem()]);

  // ── Loaders ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter   !== 'all') filters.status      = statusFilter;
      if (propertyFilter !== 'all') filters.property_id = propertyFilter;

      const res = await getHandovers(filters);
      const data: TenantHandover[] = res.data || [];
      setHandovers(data);

      // Compute stats locally
      setStats({
        total:     data.length,
        active:    data.filter(h => h.status === 'Active').length,
        confirmed: data.filter(h => h.status === 'Confirmed').length,
        pending:   data.filter(h => h.status === 'Pending').length,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load handovers');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, propertyFilter]);

 const loadTenants = useCallback(async () => {
  try {
    const res = await listTenants({ is_active: true });
    const list = res?.data || [];
    const arr = Array.isArray(list) ? list : [];
    setTenants(arr.map((t: any) => ({
      id:    String(t.id),
      name:  t.full_name || '',
      phone: t.phone     || '',
      email: t.email     || '',
      // baaki fields tenant select pe fetch honge
    })));
  } catch (err) {
    console.error('Could not load tenants:', err);
  }
}, []);

  const loadProperties = useCallback(async () => {
    try {
      const res = await listProperties({ is_active: true });
      const list = res?.data?.data || res?.data || [];
      const arr = Array.isArray(list) ? list : Object.values(list);
      setProperties(arr.map((p: any) => ({ id: String(p.id), name: p.name })));
    } catch (err) {
      console.error('Could not load properties:', err);
    }
  }, []);

  useEffect(() => { loadTenants(); loadProperties(); }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Tenant auto-fill ──────────────────────────────────────────────────────
// handleTenantSelect — tenant select karo toh details fetch karo
const handleTenantSelect = async (tenantId: string) => {
  const t = tenants.find(t => String(t.id) === tenantId);
  if (!t) return;

  // Pehle basic fill karo
  setFormData(p => ({
    ...p,
    tenant_id:   String(t.id),
    tenant_name: t.name  || '',
    tenant_phone: t.phone || '',
    tenant_email: t.email || '',
  }));

  // Phir detailed profile fetch karo
  try {
    const res = await tenantDetailsApi.getProfileById(tenantId);
    const d = res?.data;
    if (!d) return;

    setFormData(p => ({
      ...p,
      property_id:      String(d.property_id || ''),
      property_name:    d.property_name    || '',
      room_number:      d.room_number      || '',
      bed_number:       String(d.bed_number || ''),
      move_in_date:     d.check_in_date    || p.move_in_date,
      security_deposit: 0,                  // tenantDetailsApi mein nahi hai
      rent_amount:      d.monthly_rent     || d.rent_per_bed || 0,
    }));
  } catch (err) {
    console.error('Could not fetch tenant details:', err);
  }
};

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return handovers.filter(h => {
      const cs = colSearch;
      const n  = !cs.tenant_name   || h.tenant_name?.toLowerCase().includes(cs.tenant_name.toLowerCase());
      const p  = !cs.property_name || h.property_name?.toLowerCase().includes(cs.property_name.toLowerCase());
      const r  = !cs.room_number   || h.room_number?.toLowerCase().includes(cs.room_number.toLowerCase());
      const s  = !cs.status        || h.status?.toLowerCase().includes(cs.status.toLowerCase());
      const d  = !cs.handover_date || fmt(h.handover_date).includes(cs.handover_date);
      return n && p && r && s && d;
    });
  }, [handovers, colSearch]);

  // ── CRUD ─────────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setHandoverItems([emptyHandoverItem()]);
    setCurrentStep(1);
    setShowForm(true);
  };

  const openEdit = async (h: TenantHandover) => {
    setEditingItem(h);
    setFormData({
      tenant_id:        h.tenant_id        || '',
      tenant_name:      h.tenant_name      || '',
      tenant_phone:     h.tenant_phone     || '',
      tenant_email:     h.tenant_email     || '',
      property_id:      h.property_id      || '',
      property_name:    h.property_name    || '',
      room_number:      h.room_number      || '',
      bed_number:       h.bed_number       || '',
      move_in_date:     h.move_in_date     || '',
      handover_date:    h.handover_date    || '',
      inspector_name:   h.inspector_name   || '',
      security_deposit: h.security_deposit || 0,
      rent_amount:      h.rent_amount      || 0,
      notes:            h.notes            || '',
      status:           h.status           || 'Active',
    });
    setHandoverItems(h.handover_items?.length ? h.handover_items : [emptyHandoverItem()]);
    setCurrentStep(1);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.tenant_name || !formData.property_id || !formData.room_number) {
      toast.error('Tenant, property and room are required');
      return;
    }
    if (currentStep === 1) { setCurrentStep(2); return; }

    setSubmitting(true);
    try {
      const payload = { ...formData, handover_items: handoverItems };
      if (editingItem) {
        await updateHandover(editingItem.id, payload);
        toast.success('Handover updated successfully');
      } else {
        await createHandover(payload);
        toast.success('Handover created successfully');
      }
      setShowForm(false);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save handover');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete handover for "${name || id}"? This cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      width: '400px',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg mx-1',
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteHandover(id);
      await loadAll();
      Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false, width: '350px' });
    } catch (err: any) {
      Swal.fire({ title: 'Error!', text: err.message, icon: 'error', width: '350px' });
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['Tenant', 'Phone', 'Property', 'Room', 'Bed', 'Move-In', 'Handover Date', 'Deposit', 'Rent', 'Items', 'Status'];
    const rows = filteredItems.map(h => [
      h.tenant_name, h.tenant_phone, h.property_name, h.room_number,
      h.bed_number || '', fmt(h.move_in_date), fmt(h.handover_date),
      h.security_deposit, h.rent_amount,
      h.handover_items?.length || 0, h.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `handovers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const hasFilters    = statusFilter !== 'all' || propertyFilter !== 'all';
  const hasColSearch  = Object.values(colSearch).some(v => v !== '');
  const activeCount   = [statusFilter !== 'all', propertyFilter !== 'all'].filter(Boolean).length;
  const clearFilters  = () => { setStatusFilter('all'); setPropertyFilter('all'); };
  const clearColSearch = () => setColSearch({ tenant_name: '', property_name: '', room_number: '', status: '', handover_date: '' });

  // ── Handover Items helpers ────────────────────────────────────────────────
  const addHandoverItem = () => setHandoverItems(p => [...p, emptyHandoverItem()]);
  const removeHandoverItem = (i: number) => {
    if (handoverItems.length === 1) { toast.error('At least one item required'); return; }
    setHandoverItems(p => p.filter((_, idx) => idx !== i));
  };
  const updateHandoverItem = (i: number, field: keyof HandoverItem, value: any) => {
    setHandoverItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  // ════════════════════════════════════════════════════════════════════════════
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
              <span className="hidden xs:inline">Add Handover</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 sm:px-5 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard title="Total Handovers" value={stats.total}
              icon={FileText}      color="bg-blue-600"   bg="bg-gradient-to-br from-blue-50 to-blue-100" />
            <StatCard title="Active"          value={stats.active}
              icon={Boxes}         color="bg-green-600"  bg="bg-gradient-to-br from-green-50 to-green-100" />
            <StatCard title="Confirmed"       value={stats.confirmed}
              icon={ShieldCheck}   color="bg-emerald-600" bg="bg-gradient-to-br from-emerald-50 to-emerald-100" />
            <StatCard title="Pending"         value={stats.pending}
              icon={AlertTriangle} color="bg-amber-600"  bg="bg-gradient-to-br from-amber-50 to-amber-100" />
          </div>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────────────── */}
      <div className="relative">
        <main className="p-3 sm:p-4">
          <Card className="border rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-white rounded-t-lg">
              <span className="text-sm font-semibold text-gray-700">
                All Handovers ({filteredItems.length})
              </span>
              {hasColSearch && (
                <button onClick={clearColSearch} className="text-[10px] text-blue-600 font-semibold">
                  Clear Search
                </button>
              )}
            </div>

            <div className="overflow-auto max-h-[calc(100vh-310px)]">
              <div className="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    {/* Column headers */}
                    <TableRow>
                      <TableHead className="py-2 px-3 text-xs">Tenant</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Phone</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Property</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Room/Bed</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Move-In</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Handover Date</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Deposit</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Items</TableHead>
                      <TableHead className="py-2 px-3 text-xs">Status</TableHead>
                      <TableHead className="py-2 px-3 text-xs text-right">Actions</TableHead>
                    </TableRow>

                    {/* Column search */}
                    <TableRow className="bg-gray-50/80">
                      {[
                        { key: 'tenant_name',   ph: 'Search tenant…' },
                        { key: null,            ph: '' },
                        { key: 'property_name', ph: 'Search prop…' },
                        { key: 'room_number',   ph: 'Room…' },
                        { key: null,            ph: '' },
                        { key: 'handover_date', ph: 'Date…' },
                        { key: null,            ph: '' },
                        { key: null,            ph: '' },
                        { key: 'status',        ph: 'Status…' },
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
                        <TableCell colSpan={10} className="text-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading handovers…</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12">
                          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm font-medium text-gray-500">No handovers found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.map(h => (
                      <TableRow key={h.id} className="hover:bg-gray-50">
                        <TableCell className="py-2 px-3 text-xs font-medium">{h.tenant_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{h.tenant_phone}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600 max-w-[140px] truncate">{h.property_name}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">
                          {h.room_number}{h.bed_number ? ` / ${h.bed_number}` : ''}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(h.move_in_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs text-gray-600">{fmt(h.handover_date)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs font-semibold text-gray-800">{money(h.security_deposit)}</TableCell>
                        <TableCell className="py-2 px-3 text-xs">
                          <Badge className="bg-blue-100 text-blue-700 text-[9px] px-1.5">
                            {h.handover_items?.length || 0} items
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <Badge className={`text-[9px] px-1.5 ${statusColor(h.status)}`}>{h.status}</Badge>
                        </TableCell>
                        <TableCell className="py-2 px-3">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              onClick={() => setViewItem(h)} title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-amber-50 hover:text-amber-600"
                              onClick={() => openEdit(h)} title="Edit">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                            <Button size="sm" variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              onClick={() => handleDelete(h.id, h.tenant_name)} title="Delete">
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
            {/* Status */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-blue-500" /> Status
              </p>
              <div className="space-y-1">
                {(['all', 'Active', 'Confirmed', 'Completed', 'Pending', 'Cancelled'] as StatusType[]).map(s => (
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

            {/* Property */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Building className="h-3 w-3 text-indigo-500" /> Property
              </p>
              <div className="space-y-1">
                {[{ id: 'all', name: 'All Properties' }, ...properties].map(p => (
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
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
            <div>
              <h2 className="text-base font-semibold">{editingItem ? 'Edit Handover' : 'New Tenant Handover'}</h2>
              <p className="text-xs text-blue-100">
                Step {currentStep} of 2 — {currentStep === 1 ? 'Tenant & Property Details' : 'Item Checklist'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Step indicator */}
              <div className="flex items-center gap-1.5">
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 1 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'}`}>
                  {currentStep > 1 ? <Check className="h-3 w-3" /> : '1'}
                </span>
                <div className="h-0.5 w-4 bg-blue-400" />
                <span className={`h-6 w-6 rounded-full text-[10px] font-bold flex items-center justify-center
                  ${currentStep === 2 ? 'bg-white text-blue-700' : 'bg-blue-500 text-white opacity-60'}`}>
                  2
                </span>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20 transition">
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">

            {/* ── STEP 1: Tenant & Property Details ── */}
            {currentStep === 1 && (
              <>
                {/* SECTION: Tenant */}
                <div>
                  <SH icon={<User className="h-3 w-3" />} title="Tenant Details" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

                    {/* Tenant Selector — auto-fill */}
                    <div className="col-span-2">
                      <label className={L}>Select Tenant <span className="text-red-400">*</span></label>
                      <Select value={formData.tenant_id} onValueChange={handleTenantSelect}>
                        <SelectTrigger className={F}>
                          <User className="h-3 w-3 text-gray-400 mr-1.5 flex-shrink-0" />
                          <SelectValue placeholder="Select tenant (auto-fills details)" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map(t => (
                            <SelectItem key={t.id} value={String(t.id)} className={SI}>
{t.name} — {t.phone}   
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={L}>Tenant Name <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="Auto-filled or enter manually"
                        value={formData.tenant_name}
                        onChange={e => setFormData(p => ({ ...p, tenant_name: e.target.value }))} />
                    </div>

                    <div>
                      <label className={L}>Phone <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="Auto-filled"
                        value={formData.tenant_phone}
                        onChange={e => setFormData(p => ({ ...p, tenant_phone: e.target.value }))} />
                    </div>

                    <div className="col-span-2">
                      <label className={L}>Email</label>
                      <Input className={F} type="email" placeholder="Auto-filled"
                        value={formData.tenant_email}
                        onChange={e => setFormData(p => ({ ...p, tenant_email: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* SECTION: Property */}
                <div>
                  <SH icon={<Building className="h-3 w-3" />} title="Property & Room" color="text-indigo-600" />
                  <div className="grid grid-cols-3 gap-x-3 gap-y-2.5">

                    <div className="col-span-3">
                      <label className={L}>Property <span className="text-red-400">*</span></label>
                      <Select value={formData.property_id}
                        onValueChange={v => {
                          const sel = properties.find(p => p.id === v);
                          setFormData(p => ({ ...p, property_id: v, property_name: sel?.name || '' }));
                        }}>
                        <SelectTrigger className={F}>
                          <Building className="h-3 w-3 text-gray-400 mr-1.5" />
                          <SelectValue placeholder="Select property" />
                        </SelectTrigger>
                        <SelectContent>
                          {properties.map(p => (
                            <SelectItem key={p.id} value={p.id} className={SI}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className={L}>Room No. <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="101"
                        value={formData.room_number}
                        onChange={e => setFormData(p => ({ ...p, room_number: e.target.value }))} />
                    </div>

                    <div>
                      <label className={L}>Bed No.</label>
                      <Input className={F} placeholder="A / B"
                        value={formData.bed_number}
                        onChange={e => setFormData(p => ({ ...p, bed_number: e.target.value }))} />
                    </div>

                    <div>
                      <label className={L}>Inspector <span className="text-red-400">*</span></label>
                      <Input className={F} placeholder="Inspector name"
                        value={formData.inspector_name}
                        onChange={e => setFormData(p => ({ ...p, inspector_name: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* SECTION: Dates & Financials */}
                <div>
                  <SH icon={<IndianRupee className="h-3 w-3" />} title="Dates & Financials" color="text-green-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">

                    <div>
                      <label className={L}>Move-In Date <span className="text-red-400">*</span></label>
                      <Input type="date" className={F}
                        value={formData.move_in_date}
                        onChange={e => setFormData(p => ({ ...p, move_in_date: e.target.value }))} />
                    </div>

                    <div>
                      <label className={L}>Handover Date <span className="text-red-400">*</span></label>
                      <Input type="date" className={F}
                        value={formData.handover_date}
                        onChange={e => setFormData(p => ({ ...p, handover_date: e.target.value }))} />
                    </div>

                    <div>
                      <label className={L}>Security Deposit (₹)</label>
                      <Input type="number" min={0} className={F} placeholder="0"
                        value={formData.security_deposit}
                        onChange={e => setFormData(p => ({ ...p, security_deposit: parseFloat(e.target.value) || 0 }))} />
                    </div>

                    <div>
                      <label className={L}>Rent Amount (₹)</label>
                      <Input type="number" min={0} className={F} placeholder="0"
                        value={formData.rent_amount}
                        onChange={e => setFormData(p => ({ ...p, rent_amount: parseFloat(e.target.value) || 0 }))} />
                    </div>

                    {/* Preview */}
                    <div className="col-span-2 bg-blue-50 rounded-md px-3 py-1.5 flex justify-between items-center">
                      <span className="text-[11px] text-blue-700 font-semibold">Deposit + Rent Total</span>
                      <span className="text-[12px] font-bold text-blue-800">
                        {money(formData.security_deposit + formData.rent_amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION: Status & Notes */}
                <div>
                  <SH icon={<StickyNote className="h-3 w-3" />} title="Status & Notes" color="text-amber-600" />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                    <div>
                      <label className={L}>Status</label>
                      <Select value={formData.status} onValueChange={v => setFormData(p => ({ ...p, status: v }))}>
                        <SelectTrigger className={F}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s} value={s} className={SI}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <label className={L}>Notes</label>
                      <Textarea className="text-[11px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[48px] resize-none"
                        rows={2} placeholder="Additional notes…"
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Item Checklist ── */}
            {currentStep === 2 && (
              <div>
                <SH icon={<FileText className="h-3 w-3" />} title="Item Checklist" />
                <div className="space-y-3">
                  {handoverItems.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Item {idx + 1}</span>
                        <button type="button" onClick={() => removeHandoverItem(idx)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded transition-colors">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                        <div className="col-span-2">
                          <label className={L}>Item Name <span className="text-red-400">*</span></label>
                          <Input className={F} placeholder="e.g. King Size Bed"
                            value={item.item_name}
                            onChange={e => updateHandoverItem(idx, 'item_name', e.target.value)} />
                        </div>
                        <div>
                          <label className={L}>Category</label>
                          <Select value={item.category}
                            onValueChange={v => updateHandoverItem(idx, 'category', v)}>
                            <SelectTrigger className={F}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ITEM_CATEGORIES.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={L}>Condition</label>
                          <Select value={item.condition_at_movein}
                            onValueChange={v => updateHandoverItem(idx, 'condition_at_movein', v)}>
                            <SelectTrigger className={F}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CONDITIONS.map(c => <SelectItem key={c} value={c} className={SI}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={L}>Quantity</label>
                          <Input type="number" min={1} className={F}
                            value={item.quantity}
                            onChange={e => updateHandoverItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
                        </div>
                        <div>
                          <label className={L}>Asset ID</label>
                          <Input className={F} placeholder="Optional"
                            value={item.asset_id || ''}
                            onChange={e => updateHandoverItem(idx, 'asset_id', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label className={L}>Notes</label>
                          <Input className={F} placeholder="Item notes…"
                            value={item.notes || ''}
                            onChange={e => updateHandoverItem(idx, 'notes', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={addHandoverItem}
                    className="w-full py-2.5 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add Item
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-1">
              {currentStep === 2 && (
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}
                  className="h-8 text-[11px] px-4 flex items-center gap-1.5">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
              <Button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 h-8 text-[11px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1.5">
                {submitting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…</>
                ) : currentStep === 1 ? (
                  <>Next <ChevronRight className="h-3.5 w-3.5" /></>
                ) : editingItem ? (
                  <><Check className="h-3.5 w-3.5" /> Update Handover</>
                ) : (
                  <><Check className="h-3.5 w-3.5" /> Create Handover</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DIALOG ══════════════════════════════════════════════════════ */}
      {viewItem && (
        <Dialog open={!!viewItem} onOpenChange={v => { if (!v) setViewItem(null); }}>
          <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-base font-semibold">Handover Document</h2>
                <p className="text-xs text-blue-100">{viewItem.tenant_name} — {viewItem.property_name}</p>
              </div>
              <DialogClose asChild>
                <button className="p-1.5 rounded-full hover:bg-white/20"><X className="h-4 w-4" /></button>
              </DialogClose>
            </div>
            <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ['Tenant',     viewItem.tenant_name],
                  ['Phone',      viewItem.tenant_phone],
                  ['Email',      viewItem.tenant_email || 'N/A'],
                  ['Property',   viewItem.property_name],
                  ['Room/Bed',   `${viewItem.room_number}${viewItem.bed_number ? ' / ' + viewItem.bed_number : ''}`],
                  ['Move-In',    fmt(viewItem.move_in_date)],
                  ['Handover',   fmt(viewItem.handover_date)],
                  ['Inspector',  viewItem.inspector_name],
                  ['Deposit',    money(viewItem.security_deposit)],
                  ['Rent',       money(viewItem.rent_amount)],
                  ['Status',     viewItem.status],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 font-medium">{label}</p>
                    <p className="text-[11px] font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Items table */}
              {viewItem.handover_items && viewItem.handover_items.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2">
                    Item Checklist ({viewItem.handover_items.length} items)
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-[11px]">
                      <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Item</th>
                          <th className="px-3 py-2 text-left font-semibold">Category</th>
                          <th className="px-3 py-2 text-center font-semibold">Qty</th>
                          <th className="px-3 py-2 text-center font-semibold">Condition</th>
                          <th className="px-3 py-2 text-left font-semibold">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItem.handover_items.map((item, i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-3 py-2 font-bold text-gray-500">{i + 1}</td>
                            <td className="px-3 py-2 font-medium text-gray-800">{item.item_name}</td>
                            <td className="px-3 py-2 text-gray-600">{item.category}</td>
                            <td className="px-3 py-2 text-center font-semibold">{item.quantity}</td>
                            <td className="px-3 py-2 text-center">
                              <Badge className={`text-[9px] px-1.5
                                ${item.condition_at_movein === 'New' ? 'bg-green-100 text-green-700' :
                                  item.condition_at_movein === 'Good' ? 'bg-blue-100 text-blue-700' :
                                  item.condition_at_movein === 'Used' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-orange-100 text-orange-700'}`}>
                                {item.condition_at_movein}
                              </Badge>
                            </td>
                            <td className="px-3 py-2 text-gray-500">{item.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {viewItem.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-800 mb-1">Notes</p>
                  <p className="text-[11px] text-amber-700">{viewItem.notes}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}