import { useEffect, useState } from 'react';
import { Plus, Loader2, CheckCircle, XCircle, Calculator } from 'lucide-react';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

interface Settlement {
  id: string;
  tenant_name: string;
  property_name: string;
  room_number: string;
  settlement_date: string;
  security_deposit: number;
  penalties: number;
  penalty_discount: number;
  outstanding_rent: number;
  total_deductions: number;
  refund_amount: number;
  payment_method: string;
  status: string;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
});

const dateFormatter = (date: string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN');
};

// Static data
const staticSettlements: Settlement[] = [
  {
    id: '1',
    tenant_name: 'Rahul Sharma',
    property_name: 'Sunset Villa',
    room_number: '101',
    settlement_date: '2026-03-15',
    security_deposit: 25000,
    penalties: 3500,
    penalty_discount: 500,
    outstanding_rent: 0,
    total_deductions: 3000,
    refund_amount: 22000,
    payment_method: 'Bank Transfer',
    status: 'Completed'
  },
  {
    id: '2',
    tenant_name: 'Priya Patel',
    property_name: 'Ocean View Apartment',
    room_number: '205',
    settlement_date: '2026-03-10',
    security_deposit: 30000,
    penalties: 0,
    penalty_discount: 0,
    outstanding_rent: 1500,
    total_deductions: 1500,
    refund_amount: 28500,
    payment_method: 'UPI',
    status: 'Paid'
  },
  {
    id: '3',
    tenant_name: 'Amit Kumar',
    property_name: 'Garden Heights',
    room_number: '302',
    settlement_date: '2026-03-05',
    security_deposit: 18000,
    penalties: 5500,
    penalty_discount: 1000,
    outstanding_rent: 2000,
    total_deductions: 6500,
    refund_amount: 11500,
    payment_method: 'Cash',
    status: 'Pending'
  },
  {
    id: '4',
    tenant_name: 'Neha Singh',
    property_name: 'Lakeview Residency',
    room_number: '415',
    settlement_date: '2026-03-12',
    security_deposit: 35000,
    penalties: 8000,
    penalty_discount: 2000,
    outstanding_rent: 0,
    total_deductions: 6000,
    refund_amount: 29000,
    payment_method: 'Bank Transfer',
    status: 'Pending'
  },
  {
    id: '5',
    tenant_name: 'Vikram Mehta',
    property_name: 'Sunset Villa',
    room_number: '203',
    settlement_date: '2026-03-08',
    security_deposit: 22000,
    penalties: 500,
    penalty_discount: 0,
    outstanding_rent: 0,
    total_deductions: 500,
    refund_amount: 21500,
    payment_method: 'Cheque',
    status: 'Completed'
  },
  {
    id: '6',
    tenant_name: 'Anjali Desai',
    property_name: 'Ocean View Apartment',
    room_number: '102',
    settlement_date: '2026-03-01',
    security_deposit: 28000,
    penalties: 2000,
    penalty_discount: 500,
    outstanding_rent: 3000,
    total_deductions: 4500,
    refund_amount: 23500,
    payment_method: 'UPI',
    status: 'Paid'
  },
  {
    id: '7',
    tenant_name: 'Suresh Reddy',
    property_name: 'Garden Heights',
    room_number: '501',
    settlement_date: '2026-02-28',
    security_deposit: 20000,
    penalties: 1000,
    penalty_discount: 0,
    outstanding_rent: 0,
    total_deductions: 1000,
    refund_amount: 19000,
    payment_method: 'Bank Transfer',
    status: 'Cancelled'
  },
  {
    id: '8',
    tenant_name: 'Kavita Singh',
    property_name: 'Lakeview Residency',
    room_number: '301',
    settlement_date: '2026-02-25',
    security_deposit: 32000,
    penalties: 4000,
    penalty_discount: 1000,
    outstanding_rent: 2000,
    total_deductions: 5000,
    refund_amount: 27000,
    payment_method: 'Cash',
    status: 'Completed'
  }
];

export function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSettlement, setEditingSettlement] = useState<Settlement | null>(null);

  const [formData, setFormData] = useState({
    tenant_name: '',
    property_name: '',
    room_number: '',
    settlement_date: new Date().toISOString().split('T')[0],
    security_deposit: 0,
    penalties: 0,
    penalty_discount: 0,
    outstanding_rent: 0,
    total_deductions: 0,
    refund_amount: 0,
    payment_method: 'Bank Transfer',
    status: 'Pending'
  });

  useEffect(() => {
    loadSettlements();
  }, []);

  // Auto-calculate total deductions and refund amount
  useEffect(() => {
    const netPenalties = Math.max(0, formData.penalties - formData.penalty_discount);
    const totalDeductions = netPenalties + formData.outstanding_rent;
    const refundAmount = Math.max(0, formData.security_deposit - totalDeductions);

    setFormData(prev => ({
      ...prev,
      total_deductions: totalDeductions,
      refund_amount: refundAmount
    }));
  }, [formData.penalties, formData.penalty_discount, formData.outstanding_rent, formData.security_deposit]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setSettlements(staticSettlements);
    } catch (err: any) {
      setError(err.message || 'Failed to load settlements');
      console.error('Error loading settlements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    resetForm();
    setEditingSettlement(null);
    setShowModal(true);
  };

  const handleEdit = (settlement: Settlement) => {
    setEditingSettlement(settlement);
    setFormData({
      tenant_name: settlement.tenant_name || '',
      property_name: settlement.property_name || '',
      room_number: settlement.room_number || '',
      settlement_date: settlement.settlement_date || new Date().toISOString().split('T')[0],
      security_deposit: settlement.security_deposit || 0,
      penalties: settlement.penalties || 0,
      penalty_discount: settlement.penalty_discount || 0,
      outstanding_rent: settlement.outstanding_rent || 0,
      total_deductions: settlement.total_deductions || 0,
      refund_amount: settlement.refund_amount || 0,
      payment_method: settlement.payment_method || 'Bank Transfer',
      status: settlement.status || 'Pending'
    });
    setShowModal(true);
  };

  const handleDelete = async (settlement: Settlement) => {
    if (!confirm('Delete this settlement record permanently?')) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      setSettlements(prev => prev.filter(s => s.id !== settlement.id));
    } catch (err: any) {
      alert('Failed to delete settlement: ' + (err.message || 'Unknown error'));
    }
  };

  const handleBulkDelete = async (settlementsToDelete: Settlement[]) => {
    if (!confirm(`Delete ${settlementsToDelete.length} settlement records permanently?`)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const idsToDelete = new Set(settlementsToDelete.map(s => s.id));
      setSettlements(prev => prev.filter(s => !idsToDelete.has(s.id)));
    } catch (err: any) {
      alert('Failed to delete settlements: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUpdatePaymentStatus = async (settlement: Settlement) => {
    const newStatus = settlement.status === 'Pending' ? 'Completed' : 'Pending';
    const confirmMsg = settlement.status === 'Pending'
      ? `Mark settlement as COMPLETED for ${settlement.tenant_name}?`
      : `Mark settlement as PENDING for ${settlement.tenant_name}?`;

    if (!confirm(confirmMsg)) return;

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setSettlements(prev => prev.map(s =>
        s.id === settlement.id ? { ...s, status: newStatus } : s
      ));

      alert(`Settlement status updated to ${newStatus}`);
    } catch (err: any) {
      alert('Failed to update payment status: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (editingSettlement) {
        // Update existing settlement
        setSettlements(prev => prev.map(s =>
          s.id === editingSettlement.id ? { ...s, ...formData } : s
        ));
      } else {
        // Create new settlement
        const newSettlement: Settlement = {
          id: `${Date.now()}`,
          ...formData
        };
        setSettlements(prev => [newSettlement, ...prev]);
      }

      setShowModal(false);
      setEditingSettlement(null);
      resetForm();
    } catch (err: any) {
      alert('Failed to save settlement: ' + (err.message || 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_name: '',
      property_name: '',
      room_number: '',
      settlement_date: new Date().toISOString().split('T')[0],
      security_deposit: 0,
      penalties: 0,
      penalty_discount: 0,
      outstanding_rent: 0,
      total_deductions: 0,
      refund_amount: 0,
      payment_method: 'Bank Transfer',
      status: 'Pending'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paid':
      case 'Completed':
      case 'Active':
        return 'bg-emerald-100 text-emerald-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Cancelled':
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderActions = (settlement: Settlement) => (
    <div className="flex gap-2">
      <button
        onClick={() => handleUpdatePaymentStatus(settlement)}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold transition-colors ${settlement.status === 'Pending'
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          }`}
        title={settlement.status === 'Pending' ? 'Mark as Completed' : 'Mark as Pending'}
      >
        {settlement.status === 'Pending' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Complete
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            Reopen
          </>
        )}
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
      key: 'settlement_date',
      label: 'Settlement Date',
      sortable: true,
      render: (row: Settlement) => dateFormatter(row.settlement_date)
    },
    {
      key: 'security_deposit',
      label: 'Security Deposit',
      sortable: true,
      render: (row: Settlement) => currencyFormatter.format(row.security_deposit || 0)
    },
    {
      key: 'penalties',
      label: 'Penalties',
      sortable: true,
      render: (row: Settlement) => currencyFormatter.format(row.penalties || 0)
    },
    {
      key: 'penalty_discount',
      label: 'Penalty Discount',
      sortable: true,
      render: (row: Settlement) => (
        <span className="text-emerald-600">
          {currencyFormatter.format(row.penalty_discount || 0)}
        </span>
      )
    },
    {
      key: 'outstanding_rent',
      label: 'Outstanding Rent',
      sortable: true,
      render: (row: Settlement) => currencyFormatter.format(row.outstanding_rent || 0)
    },
    {
      key: 'total_deductions',
      label: 'Total Deductions',
      sortable: true,
      render: (row: Settlement) => currencyFormatter.format(row.total_deductions || 0)
    },
    {
      key: 'refund_amount',
      label: 'Refund Amount',
      sortable: true,
      render: (row: Settlement) => currencyFormatter.format(row.refund_amount || 0)
    },
    {
      key: 'payment_method',
      label: 'Payment Method',
      sortable: true,
      searchable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row: Settlement) => <StatusBadge status={row.status} />
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
            onClick={loadSettlements}
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
          Tenant Settlements
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Manage security deposit refunds and settlements</p>
      </div>

      <DataTable
        data={settlements}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        actions={renderActions}
        onExport={() => { }}
        title="Settlements"
        addButtonText="New Settlement"
        rowKey="id"
        enableBulkActions={true}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-4">
              {editingSettlement ? 'Edit Settlement' : 'New Settlement'}
            </h2>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Calculator className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-900 font-medium">
                  Total Deductions and Refund Amount are automatically calculated based on Security Deposit, Penalties, and Outstanding Rent.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Name</label>
                  <input
                    type="text"
                    required
                    value={formData.tenant_name}
                    onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Property Name</label>
                  <input
                    type="text"
                    required
                    value={formData.property_name}
                    onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Settlement Date</label>
                  <input
                    type="date"
                    required
                    value={formData.settlement_date}
                    onChange={(e) => setFormData({ ...formData, settlement_date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Security Deposit</label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Penalties</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.penalties}
                    onChange={(e) => setFormData({ ...formData, penalties: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Penalty Discount / Waiver</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.penalty_discount}
                    onChange={(e) => setFormData({ ...formData, penalty_discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-emerald-200 rounded-lg font-semibold focus:outline-none focus:border-emerald-500"
                    placeholder="Discount or waive penalties"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Outstanding Rent</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.outstanding_rent}
                    onChange={(e) => setFormData({ ...formData, outstanding_rent: Number(e.target.value) })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                    Total Deductions
                    <Calculator className="w-3 h-3 text-blue-600" title="Auto-calculated" />
                  </label>
                  <input
                    type="number"
                    required
                    readOnly
                    min="0"
                    step="0.01"
                    value={formData.total_deductions}
                    className="w-full px-3 py-2 border-2 border-blue-100 bg-blue-50 rounded-lg font-bold text-blue-900 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                    Refund Amount
                    <Calculator className="w-3 h-3 text-emerald-600" title="Auto-calculated" />
                  </label>
                  <input
                    type="number"
                    required
                    readOnly
                    min="0"
                    step="0.01"
                    value={formData.refund_amount}
                    className="w-full px-3 py-2 border-2 border-emerald-100 bg-emerald-50 rounded-lg font-bold text-emerald-900 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {editingSettlement ? 'Update' : 'Create'} Settlement
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingSettlement(null); }}
                  className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}