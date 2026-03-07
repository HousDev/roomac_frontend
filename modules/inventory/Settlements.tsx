import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, Download } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

interface Settlement {
  id: string;
  tenant_id: string;
  security_deposit: number;
  damage_charges: number;
  other_deductions: number;
  refund_amount: number;
  settlement_date: string;
  payment_method: string;
  payment_date: string | null;
  status: string;
  notes: string;
  created_at: string;
  tenant?: {
    name: string;
    tenant_id: string;
    phone: string;
    property?: { name: string };
  };
}

export function Settlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_settlements')
        .select('*, tenant:tenants(name, tenant_id, phone, property:properties(name))')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSettlements(data || []);
    } catch (error) {
      console.error('Error loading settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id: string, method: string) => {
    try {
      const { error } = await supabase
        .from('tenant_settlements')
        .update({
          status: 'Paid',
          payment_method: method,
          payment_date: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      loadSettlements();
    } catch (error) {
      console.error('Error updating settlement:', error);
      alert('Error updating settlement');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Tenant', 'Tenant ID', 'Phone', 'Property', 'Deposit', 'Damages', 'Deductions', 'Refund', 'Status', 'Payment Method'];
    const rows = filteredSettlements.map(s => [
      new Date(s.settlement_date).toLocaleDateString(),
      s.tenant?.name || 'N/A',
      s.tenant?.tenant_id || 'N/A',
      s.tenant?.phone || 'N/A',
      s.tenant?.property?.name || 'N/A',
      s.security_deposit,
      s.damage_charges,
      s.other_deductions,
      s.refund_amount,
      s.status,
      s.payment_method
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `settlements-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredSettlements = settlements.filter(s =>
    filterStatus === 'All' || s.status === filterStatus
  );

  const stats = {
    total: settlements.length,
    pending: settlements.filter(s => s.status === 'Pending').length,
    paid: settlements.filter(s => s.status === 'Paid').length,
    totalRefunds: settlements.reduce((sum, s) => sum + s.refund_amount, 0),
    totalDamages: settlements.reduce((sum, s) => sum + s.damage_charges, 0)
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Tenant Settlements
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Manage security deposit refunds and settlements</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Total Settlements</div>
          <div className="text-3xl font-black text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Pending</div>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Paid</div>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats.paid}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Total Refunds</div>
          <div className="text-2xl font-black text-gray-900 mt-1">₹{stats.totalRefunds.toFixed(0)}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-gray-600">Total Damages</div>
          <div className="text-2xl font-black text-red-600 mt-1">₹{stats.totalDamages.toFixed(0)}</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Settlements</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredSettlements.map((settlement) => (
          <div key={settlement.id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  settlement.status === 'Paid' ? 'bg-emerald-100' :
                  settlement.status === 'Pending' ? 'bg-amber-100' :
                  'bg-gray-100'
                }`}>
                  {settlement.status === 'Paid' ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : settlement.status === 'Pending' ? (
                    <Clock className="w-6 h-6 text-amber-600" />
                  ) : (
                    <DollarSign className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{settlement.tenant?.name}</h3>
                  <p className="text-sm font-semibold text-gray-600">
                    {settlement.tenant?.tenant_id} • {settlement.tenant?.phone}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    {settlement.tenant?.property?.name} • {new Date(settlement.settlement_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                settlement.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                settlement.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {settlement.status}
              </span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-xs font-bold text-gray-600">Security Deposit</div>
                <div className="text-xl font-black text-gray-900">₹{settlement.security_deposit}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-xs font-bold text-gray-600">Damage Charges</div>
                <div className="text-xl font-black text-red-600">₹{settlement.damage_charges}</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="text-xs font-bold text-gray-600">Other Deductions</div>
                <div className="text-xl font-black text-amber-600">₹{settlement.other_deductions}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-xs font-bold text-gray-600">Refund Amount</div>
                <div className="text-xl font-black text-emerald-600">₹{settlement.refund_amount}</div>
              </div>
            </div>

            {settlement.status === 'Pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => markAsPaid(settlement.id, 'Cash')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Mark as Paid (Cash)
                </button>
                <button
                  onClick={() => markAsPaid(settlement.id, 'Bank Transfer')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all"
                >
                  Mark as Paid (Bank)
                </button>
                <button
                  onClick={() => markAsPaid(settlement.id, 'UPI')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-all"
                >
                  Mark as Paid (UPI)
                </button>
              </div>
            )}

            {settlement.status === 'Paid' && settlement.payment_date && (
              <div className="p-3 bg-emerald-50 rounded-lg">
                <div className="text-sm font-bold text-emerald-700">
                  Paid on {new Date(settlement.payment_date).toLocaleDateString()} via {settlement.payment_method}
                </div>
              </div>
            )}

            {settlement.notes && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs font-bold text-gray-600 mb-1">Notes:</div>
                <div className="text-sm font-semibold text-gray-700">{settlement.notes}</div>
              </div>
            )}
          </div>
        ))}

        {filteredSettlements.length === 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Settlements Found</h3>
            <p className="text-gray-600 font-semibold">Settlements will appear here after move-out inspections</p>
          </div>
        )}
      </div>
    </div>
  );
}
