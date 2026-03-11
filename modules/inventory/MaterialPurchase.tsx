import { useEffect, useState } from 'react';
import { Plus, Trash2, DollarSign, Eye, Loader2, X, Download, Printer } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MaterialPurchase {
  id: string;
  purchase_date: string;
  vendor_name: string;
  vendor_phone?: string;
  invoice_number: string;
  property_name: string;
  total_amount: number;
  paid_amount?: number;
  balance_amount?: number;
  payment_status: string;
  payment_method?: string;
  items_summary: string;
  notes?: string;
  purchase_items?: PurchaseItem[];
  purchase_payments?: PurchasePayment[];
}

interface PurchaseItem {
  id?: string;
  purchase_id?: string;
  item_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

interface PurchasePayment {
  id?: string;
  purchase_id?: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  paid_by?: string;
  payment_reference?: string;
  notes?: string;
}

export function MaterialPurchase() {
  const [purchases, setPurchases] = useState<MaterialPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<MaterialPurchase | null>(null);

  const [formData, setFormData] = useState({
    purchase_date: new Date().toISOString().split('T')[0],
    vendor_name: '',
    vendor_phone: '',
    invoice_number: '',
    property_name: '',
    notes: ''
  });

  const [lineItems, setLineItems] = useState<PurchaseItem[]>([{
    item_name: '',
    category: '',
    quantity: 0,
    unit_price: 0,
    total_price: 0,
    notes: ''
  }]);

  const [paymentData, setPaymentData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'Cash',
    payment_reference: '',
    paid_by: '',
    notes: ''
  });

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Static data
      const staticPurchases: MaterialPurchase[] = [
        {
          id: '1',
          purchase_date: '2026-03-01',
          vendor_name: 'Furniture World',
          vendor_phone: '9876543210',
          invoice_number: 'INV-2026-001',
          property_name: 'Sunset Villa',
          total_amount: 65000,
          paid_amount: 35000,
          balance_amount: 30000,
          payment_status: 'Partial',
          items_summary: 'King Size Bed (2), Dining Table (1)',
          notes: 'Delivery scheduled for next week',
          purchase_items: [
            {
              id: '101',
              purchase_id: '1',
              item_name: 'King Size Bed',
              category: 'Furniture',
              quantity: 2,
              unit_price: 25000,
              total_price: 50000,
              notes: 'Wooden frame with storage'
            },
            {
              id: '102',
              purchase_id: '1',
              item_name: 'Dining Table',
              category: 'Furniture',
              quantity: 1,
              unit_price: 15000,
              total_price: 15000,
              notes: '6-seater with glass top'
            }
          ],
          purchase_payments: [
            {
              id: '1001',
              purchase_id: '1',
              payment_date: '2026-03-01',
              amount: 35000,
              payment_method: 'Bank Transfer',
              paid_by: 'Rahul Sharma',
              payment_reference: 'RTGS/123456',
              notes: 'Advance payment'
            }
          ]
        },
        {
          id: '2',
          purchase_date: '2026-02-15',
          vendor_name: 'Appliances Store',
          vendor_phone: '8765432109',
          invoice_number: 'INV-2026-002',
          property_name: 'Ocean View Apartment',
          total_amount: 48000,
          paid_amount: 48000,
          balance_amount: 0,
          payment_status: 'Paid',
          items_summary: 'Refrigerator (2), Microwave (2)',
          purchase_items: [
            {
              id: '103',
              purchase_id: '2',
              item_name: 'Refrigerator',
              category: 'Appliances',
              quantity: 2,
              unit_price: 18000,
              total_price: 36000,
              notes: 'Single door, 190L'
            },
            {
              id: '104',
              purchase_id: '2',
              item_name: 'Microwave Oven',
              category: 'Appliances',
              quantity: 2,
              unit_price: 6000,
              total_price: 12000,
              notes: '20L, convection'
            }
          ],
          purchase_payments: [
            {
              id: '1002',
              purchase_id: '2',
              payment_date: '2026-02-15',
              amount: 48000,
              payment_method: 'Cash',
              paid_by: 'Priya Patel',
              payment_reference: '',
              notes: 'Full payment'
            }
          ]
        },
        {
          id: '3',
          purchase_date: '2026-03-05',
          vendor_name: 'Bedding & Linens',
          vendor_phone: '7654321098',
          invoice_number: 'INV-2026-003',
          property_name: 'Garden Heights',
          total_amount: 15800,
          paid_amount: 0,
          balance_amount: 15800,
          payment_status: 'Pending',
          items_summary: 'Mattresses (3), Pillows (4)',
          notes: '30 days credit',
          purchase_items: [
            {
              id: '105',
              purchase_id: '3',
              item_name: 'Queen Size Mattress',
              category: 'Bedding',
              quantity: 3,
              unit_price: 4500,
              total_price: 13500,
              notes: 'Memory foam'
            },
            {
              id: '106',
              purchase_id: '3',
              item_name: 'Pillows',
              category: 'Bedding',
              quantity: 4,
              unit_price: 575,
              total_price: 2300,
              notes: 'Microfiber'
            }
          ],
          purchase_payments: []
        },
        {
          id: '4',
          purchase_date: '2026-02-20',
          vendor_name: 'Sofa & Decor',
          vendor_phone: '6543210987',
          invoice_number: 'INV-2026-004',
          property_name: 'Lakeview Residency',
          total_amount: 45000,
          paid_amount: 15000,
          balance_amount: 30000,
          payment_status: 'Partial',
          items_summary: '3-Seater Sofa (1), Coffee Table (1)',
          purchase_items: [
            {
              id: '107',
              purchase_id: '4',
              item_name: '3-Seater Sofa',
              category: 'Furniture',
              quantity: 1,
              unit_price: 35000,
              total_price: 35000,
              notes: 'Fabric upholstery'
            },
            {
              id: '108',
              purchase_id: '4',
              item_name: 'Coffee Table',
              category: 'Furniture',
              quantity: 1,
              unit_price: 10000,
              total_price: 10000,
              notes: 'Wooden with glass top'
            }
          ],
          purchase_payments: [
            {
              id: '1003',
              purchase_id: '4',
              payment_date: '2026-02-20',
              amount: 15000,
              payment_method: 'UPI',
              paid_by: 'Amit Kumar',
              payment_reference: 'upi@123456',
              notes: 'Advance payment'
            }
          ]
        },
        {
          id: '5',
          purchase_date: '2026-01-10',
          vendor_name: 'Home Essentials',
          vendor_phone: '5432109876',
          invoice_number: 'INV-2026-005',
          property_name: 'Sunset Villa',
          total_amount: 22400,
          paid_amount: 22400,
          balance_amount: 0,
          payment_status: 'Paid',
          items_summary: 'Curtains (10), Bed Sheets (8)',
          purchase_items: [
            {
              id: '109',
              purchase_id: '5',
              item_name: 'Curtains',
              category: 'Home Decor',
              quantity: 10,
              unit_price: 1200,
              total_price: 12000,
              notes: 'Cotton, 7ft'
            },
            {
              id: '110',
              purchase_id: '5',
              item_name: 'Bed Sheets',
              category: 'Bedding',
              quantity: 8,
              unit_price: 1300,
              total_price: 10400,
              notes: 'Cotton, king size'
            }
          ],
          purchase_payments: [
            {
              id: '1004',
              purchase_id: '5',
              payment_date: '2026-01-10',
              amount: 22400,
              payment_method: 'Cheque',
              paid_by: 'Rahul Sharma',
              payment_reference: 'CHQ/001234',
              notes: 'Payment via cheque'
            }
          ]
        }
      ];

      setPurchases(staticPurchases);
    } catch (error: any) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      item_name: '',
      category: '',
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      notes: ''
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const updated = [...lineItems];
    updated.splice(index, 1);
    setLineItems(updated);
  };

  const updateLineItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      updated[index].total_price = updated[index].quantity * updated[index].unit_price;
    }

    setLineItems(updated);
  };

  const getTotalAmount = () => {
    return lineItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lineItems.length === 0 || lineItems.some(item => !item.item_name || item.quantity <= 0)) {
      alert('Please add at least one valid item');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const totalAmount = getTotalAmount();
      const itemsSummary = lineItems.map(item => `${item.item_name} (${item.quantity})`).join(', ');

      // Generate new purchase
      const newPurchase: MaterialPurchase = {
        id: Date.now().toString(),
        purchase_date: formData.purchase_date,
        vendor_name: formData.vendor_name,
        vendor_phone: formData.vendor_phone,
        invoice_number: formData.invoice_number,
        property_name: formData.property_name,
        total_amount: totalAmount,
        paid_amount: 0,
        balance_amount: totalAmount,
        payment_status: 'Pending',
        items_summary: itemsSummary,
        notes: formData.notes,
        purchase_items: lineItems.map((item, index) => ({
          id: `${Date.now()}-${index}`,
          purchase_id: Date.now().toString(),
          ...item
        })),
        purchase_payments: []
      };

      setPurchases(prev => [newPurchase, ...prev]);

      resetPurchaseForm();
      alert('Purchase created successfully!');
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      alert('Failed to create purchase');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPurchase) return;

    const remaining = (selectedPurchase.balance_amount || selectedPurchase.total_amount) || 0;
    if (paymentData.amount > remaining) {
      alert(`Payment amount cannot exceed remaining balance: ₹${remaining.toLocaleString('en-IN')}`);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create new payment
      const newPayment: PurchasePayment = {
        id: `${Date.now()}`,
        purchase_id: selectedPurchase.id,
        payment_date: paymentData.payment_date,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        paid_by: paymentData.paid_by,
        payment_reference: paymentData.payment_reference,
        notes: paymentData.notes
      };

      // Update purchase
      setPurchases(prev => prev.map(purchase => {
        if (purchase.id === selectedPurchase.id) {
          const newPaidAmount = (purchase.paid_amount || 0) + paymentData.amount;
          const newBalanceAmount = purchase.total_amount - newPaidAmount;

          return {
            ...purchase,
            paid_amount: newPaidAmount,
            balance_amount: newBalanceAmount,
            payment_status: newBalanceAmount === 0 ? 'Paid' : 'Partial',
            purchase_payments: [...(purchase.purchase_payments || []), newPayment]
          };
        }
        return purchase;
      }));

      alert(`✅ Payment of ₹${paymentData.amount.toLocaleString('en-IN')} added successfully!`);
      resetPaymentForm();
      setShowPaymentModal(false);
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  const handleViewDetails = async (purchase: MaterialPurchase) => {
    try {
      // Find the full purchase with items and payments
      const fullPurchase = purchases.find(p => p.id === purchase.id);
      setSelectedPurchase(fullPurchase || null);
      setShowDetailsModal(true);
    } catch (error: any) {
      console.error('Error loading purchase details:', error);
      alert('Failed to load purchase details');
    }
  };

  const handleDelete = async (purchase: MaterialPurchase) => {
    if (!confirm(`Are you sure you want to delete purchase ${purchase.invoice_number}? This action cannot be undone.`)) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));

      setPurchases(prev => prev.filter(p => p.id !== purchase.id));
      alert('Purchase deleted successfully');
    } catch (error: any) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
    }
  };

  const handleBulkDelete = async (purchasesToDelete: MaterialPurchase[]) => {
    if (!confirm(`Are you sure you want to delete ${purchasesToDelete.length} purchase(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const idsToDelete = new Set(purchasesToDelete.map(p => p.id));
      setPurchases(prev => prev.filter(p => !idsToDelete.has(p.id)));
      alert(`${purchasesToDelete.length} purchase(s) deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting purchases:', error);
      alert('Failed to delete some purchases');
    }
  };

  const handleAddPayment = (purchase: MaterialPurchase) => {
    setSelectedPurchase(purchase);
    const remaining = (purchase.balance_amount || purchase.total_amount) || 0;
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      amount: remaining,
      payment_method: 'Cash',
      payment_reference: '',
      paid_by: '',
      notes: ''
    });
    setShowPaymentModal(true);
  };

  const resetPurchaseForm = () => {
    setFormData({
      purchase_date: new Date().toISOString().split('T')[0],
      vendor_name: '',
      vendor_phone: '',
      invoice_number: '',
      property_name: '',
      notes: ''
    });
    setLineItems([{
      item_name: '',
      category: '',
      quantity: 0,
      unit_price: 0,
      total_price: 0,
      notes: ''
    }]);
    setShowPurchaseForm(false);
  };

  const resetPaymentForm = () => {
    setPaymentData({
      payment_date: new Date().toISOString().split('T')[0],
      amount: 0,
      payment_method: 'Cash',
      payment_reference: '',
      paid_by: '',
      notes: ''
    });
    setSelectedPurchase(null);
  };

  const handleDownloadPDF = () => {
    if (!selectedPurchase) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIAL PURCHASE', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Purchase Order & Payment Details', pageWidth / 2, 25, { align: 'center' });

    let yPos = 45;

    // Purchase Info Box
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(14, yPos, pageWidth - 28, 40, 2, 2, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const leftCol = 18;
    const rightCol = pageWidth / 2 + 5;

    doc.text('Invoice Number:', leftCol, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedPurchase.invoice_number, leftCol + 35, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Date:', rightCol, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN'), rightCol + 32, yPos + 8);

    doc.setFont('helvetica', 'bold');
    doc.text('Vendor:', leftCol, yPos + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedPurchase.vendor_name, leftCol + 35, yPos + 18);

    if (selectedPurchase.vendor_phone) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(selectedPurchase.vendor_phone, leftCol + 35, yPos + 24);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Property:', rightCol, yPos + 18);
    doc.setFont('helvetica', 'normal');
    doc.text(selectedPurchase.property_name, rightCol + 32, yPos + 18);

    yPos += 50;

    // Purchase Items Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Purchase Items', 14, yPos);
    yPos += 5;

    const itemsData = selectedPurchase.purchase_items?.map(item => [
      item.item_name,
      item.category,
      item.quantity.toString(),
      `₹${item.unit_price.toLocaleString('en-IN')}`,
      `₹${item.total_price.toLocaleString('en-IN')}`
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['Item Name', 'Category', 'Qty', 'Unit Price', 'Total']],
      body: itemsData,
      foot: [['', '', '', 'Total Amount:', `₹${selectedPurchase.total_amount.toLocaleString('en-IN')}`]],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontSize: 10, fontStyle: 'bold' },
      footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontSize: 11, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Payment History
    if (selectedPurchase.purchase_payments && selectedPurchase.purchase_payments.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment History', 14, yPos);
      yPos += 5;

      const paymentsData = selectedPurchase.purchase_payments.map(payment => [
        new Date(payment.payment_date).toLocaleDateString('en-IN'),
        payment.paid_by || '-',
        payment.payment_method,
        payment.payment_reference || '-',
        `₹${payment.amount.toLocaleString('en-IN')}`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Paid By', 'Method', 'Reference', 'Amount']],
        body: paymentsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 30 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }
        }
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Payment Summary Box
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(14, yPos, pageWidth - 28, 25, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const summaryY = yPos + 8;
    doc.setTextColor(55, 65, 81);
    doc.text('Total Amount:', 20, summaryY);
    doc.text(`₹${selectedPurchase.total_amount.toLocaleString('en-IN')}`, 60, summaryY);

    doc.setTextColor(16, 185, 129);
    doc.text('Paid:', 20, summaryY + 8);
    doc.text(`₹${(selectedPurchase.paid_amount || 0).toLocaleString('en-IN')}`, 60, summaryY + 8);

    doc.setTextColor(239, 68, 68);
    doc.text('Balance Due:', 110, summaryY);
    doc.setFontSize(12);
    doc.text(`₹${(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}`, 150, summaryY);

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Material_Purchase_${selectedPurchase.invoice_number}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700';
      case 'Partial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  const columns = [
    {
      key: 'purchase_date',
      label: 'Date',
      render: (row: MaterialPurchase) => row?.purchase_date ? new Date(row.purchase_date).toLocaleDateString('en-IN') : 'N/A'
    },
    {
      key: 'invoice_number',
      label: 'Invoice #',
      render: (row: MaterialPurchase) => row?.invoice_number || '-'
    },
    {
      key: 'vendor_name',
      label: 'Vendor',
      render: (row: MaterialPurchase) => row?.vendor_name || '-'
    },
    {
      key: 'vendor_phone',
      label: 'Phone',
      render: (row: MaterialPurchase) => row?.vendor_phone || 'N/A'
    },
    {
      key: 'property_name',
      label: 'Property',
      render: (row: MaterialPurchase) => row?.property_name || '-'
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      render: (row: MaterialPurchase) => `₹${(row?.total_amount || 0).toLocaleString('en-IN')}`
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      render: (row: MaterialPurchase) => `₹${(row?.paid_amount || 0).toLocaleString('en-IN')}`
    },
    {
      key: 'balance_amount',
      label: 'Balance',
      render: (row: MaterialPurchase) => `₹${(row?.balance_amount || row?.total_amount || 0).toLocaleString('en-IN')}`
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (row: MaterialPurchase) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(row?.payment_status || 'Pending')}`}>
          {row?.payment_status || 'Pending'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: MaterialPurchase) => renderActions(row)
    }
  ];

  const renderActions = (row: MaterialPurchase) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleViewDetails(row)}
        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-200 transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
      {row?.payment_status !== 'Paid' && (
        <button
          onClick={() => handleAddPayment(row)}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors"
          title="Add Payment"
        >
          <DollarSign className="w-4 h-4" />
          Pay
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Material Purchases
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Track vendor purchases and payments</p>
        </div>
      </div>

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={resetPurchaseForm}>
          <div className="bg-white rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black text-gray-900">New Material Purchase</h2>
              <button
                onClick={resetPurchaseForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmitPurchase} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="INV-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.vendor_name}
                    onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Vendor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Vendor Phone</label>
                  <input
                    type="tel"
                    value={formData.vendor_phone}
                    onChange={(e) => setFormData({ ...formData, vendor_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property *</label>
                  <input
                    type="text"
                    required
                    value={formData.property_name}
                    onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="Property name"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-gray-700">Purchase Items *</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid md:grid-cols-7 gap-2 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        required
                        placeholder="Item name *"
                        value={item.item_name}
                        onChange={(e) => updateLineItem(index, 'item_name', e.target.value)}
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Category *"
                        value={item.category}
                        onChange={(e) => updateLineItem(index, 'category', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty *"
                        value={item.quantity || ''}
                        onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="Price *"
                        value={item.unit_price || ''}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <div className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-bold text-gray-700 flex items-center">
                        ₹{item.total_price.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="p-2 hover:bg-red-100 rounded-lg"
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-black text-blue-600">
                      ₹{getTotalAmount().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Additional notes"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  Create Purchase
                </button>
                <button
                  type="button"
                  onClick={resetPurchaseForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-600">Total Purchases</div>
              <div className="text-3xl font-black text-gray-900 mt-1">{purchases.length}</div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-600">Total Amount</div>
              <div className="text-3xl font-black text-gray-900 mt-1">
                ₹{purchases.reduce((sum, p) => sum + (p?.total_amount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-600">Total Paid</div>
              <div className="text-3xl font-black text-emerald-600 mt-1">
                ₹{purchases.reduce((sum, p) => sum + (p?.paid_amount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-sm font-bold text-gray-600">Balance Due</div>
              <div className="text-3xl font-black text-red-600 mt-1">
                ₹{purchases.reduce((sum, p) => sum + (p?.balance_amount || p?.total_amount || 0), 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={purchases}
          onAdd={() => setShowPurchaseForm(true)}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onExport={() => { }}
          title="Material Purchases"
          addButtonText="Add New Purchase"
          enableBulkActions={true}
          loading={loading}
          itemsPerPage={10}
        />
      </div>

      {showPaymentModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-gray-900">Add Payment</h3>
              <button onClick={() => { setShowPaymentModal(false); resetPaymentForm(); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Invoice: {selectedPurchase.invoice_number}</div>
              <div className="text-sm text-gray-600">Vendor: {selectedPurchase.vendor_name}</div>
              <div className="text-sm font-bold text-red-600 mt-1">
                Balance Due: ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
              </div>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  max={(selectedPurchase.balance_amount || selectedPurchase.total_amount)}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method *</label>
                <select
                  required
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Paid By *</label>
                <input
                  type="text"
                  required
                  value={paymentData.paid_by}
                  onChange={(e) => setPaymentData({ ...paymentData, paid_by: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Name of person making payment"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Reference</label>
                <input
                  type="text"
                  value={paymentData.payment_reference}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  placeholder="Transaction ID, Cheque #, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Add Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto print:p-0 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl my-8 shadow-2xl print:shadow-none print:rounded-none print:max-w-full animate-in fade-in slide-in-from-bottom-4 duration-300" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 rounded-t-2xl print:rounded-none print:bg-emerald-600">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white">Material Purchase</h2>
                  <p className="text-sm text-emerald-100 mt-1">Purchase Order & Payment Details</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors print:hidden"
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors print:hidden"
                    title="Print"
                  >
                    <Printer className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors print:hidden"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6 print:p-6">

              {/* Purchase Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Invoice Number</div>
                    <div className="text-lg font-black text-gray-900">{selectedPurchase.invoice_number}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Purchase Date</div>
                    <div className="text-lg font-black text-gray-900">
                      {new Date(selectedPurchase.purchase_date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Vendor</div>
                    <div className="text-lg font-black text-gray-900">{selectedPurchase.vendor_name}</div>
                    {selectedPurchase.vendor_phone && (
                      <div className="text-sm text-gray-600 font-semibold mt-0.5">{selectedPurchase.vendor_phone}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Property</div>
                    <div className="text-lg font-black text-gray-900">{selectedPurchase.property_name}</div>
                  </div>
                </div>
              </div>

              {/* Purchase Items */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Purchase Items</h3>
                </div>
                <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-cyan-600">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-white uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {selectedPurchase.purchase_items?.map((item, index) => (
                        <tr key={index} className="border-t-2 border-gray-100 hover:bg-blue-50 transition-colors">
                          <td className="px-4 py-3 font-bold text-gray-900">{item.item_name}</td>
                          <td className="px-4 py-3 text-gray-700 font-semibold">{item.category}</td>
                          <td className="px-4 py-3 text-center font-bold text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-700">₹{item.unit_price.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right font-black text-gray-900">₹{item.total_price.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-4 border-gray-300">
                        <td colSpan={4} className="px-4 py-4 text-right font-black text-gray-900 uppercase tracking-wide">Total Amount:</td>
                        <td className="px-4 py-4 text-right font-black text-2xl text-blue-600">
                          ₹{selectedPurchase.total_amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-1 bg-emerald-600 rounded-full"></div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-wide">Payment History</h3>
                </div>
                {selectedPurchase.purchase_payments && selectedPurchase.purchase_payments.length > 0 ? (
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Paid By</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Method</th>
                          <th className="px-4 py-3 text-left text-xs font-black text-white uppercase tracking-wider">Reference</th>
                          <th className="px-4 py-3 text-right text-xs font-black text-white uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {selectedPurchase.purchase_payments.map((payment, index) => (
                          <tr key={index} className="border-t-2 border-gray-100 hover:bg-emerald-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-700">
                              {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">{payment.paid_by || '-'}</td>
                            <td className="px-4 py-3 font-semibold text-gray-700">{payment.payment_method}</td>
                            <td className="px-4 py-3 font-semibold text-gray-600">{payment.payment_reference || '-'}</td>
                            <td className="px-4 py-3 text-right font-black text-emerald-600">
                              ₹{payment.amount.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 text-center">
                    <div className="text-gray-400 font-bold">No payments recorded yet</div>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Total Amount</div>
                    <div className="text-2xl font-black text-gray-900">
                      ₹{selectedPurchase.total_amount.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-center border-l-2 border-r-2 border-gray-300">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Paid Amount</div>
                    <div className="text-2xl font-black text-emerald-600">
                      ₹{(selectedPurchase.paid_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Balance Due</div>
                    <div className="text-2xl font-black text-red-600">
                      ₹{(selectedPurchase.balance_amount || selectedPurchase.total_amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {selectedPurchase.notes && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Notes</div>
                  <div className="text-sm font-semibold text-amber-800">{selectedPurchase.notes}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-4 rounded-b-2xl border-t-2 border-gray-200 print:hidden">
              <div className="text-center text-xs text-gray-500 font-semibold">
                Generated on {new Date().toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}