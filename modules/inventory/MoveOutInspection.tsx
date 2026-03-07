import { useEffect, useState } from 'react';
import { Plus, ClipboardCheck, AlertCircle } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { Tenant } from '../../types/masters';

interface Inspection {
  id: string;
  tenant_id: string;
  inspection_date: string;
  total_damage_cost: number;
  deductions: number;
  refund_amount: number;
  status: string;
  created_at: string;
  tenant?: Tenant;
}

export function MoveOutInspection() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tenant_id: '',
    inspection_date: new Date().toISOString().split('T')[0],
    room_condition: '',
    furniture_condition: '',
    cleanliness_rating: 5,
    damages_found: '',
    total_damage_cost: 0,
    notes: ''
  });

  useEffect(() => {
    loadInspections();
    loadActiveTenants();
  }, []);

  const loadInspections = async () => {
    try {
      const { data, error } = await supabase
        .from('moveout_inspections')
        .select('*, tenant:tenants(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error loading inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveTenants = async () => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, property:properties(name), room:rooms(room_number)')
        .eq('status', 'Active')
        .order('name');
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTenant = tenants.find(t => t.id === formData.tenant_id);
    if (!selectedTenant) {
      alert('Please select a tenant');
      return;
    }

    const securityDeposit = selectedTenant.security_deposit || 0;
    const refundAmount = Math.max(0, securityDeposit - formData.total_damage_cost);
    const deductions = securityDeposit - refundAmount;

    try {
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('moveout_inspections')
        .insert([{
          tenant_id: formData.tenant_id,
          tenant_uuid: formData.tenant_id,
          inspection_date: formData.inspection_date,
          room_condition: formData.room_condition,
          furniture_condition: formData.furniture_condition,
          cleanliness_rating: formData.cleanliness_rating,
          damages_found: formData.damages_found,
          total_damage_cost: formData.total_damage_cost,
          deductions: deductions,
          refund_amount: refundAmount,
          status: formData.total_damage_cost > 0 ? 'Damages Found' : 'Cleared',
          notes: formData.notes,
          inspector_name: 'Admin',
          inspector_signature: 'SIGNED'
        }])
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      await supabase
        .from('tenants')
        .update({
          status: 'Vacated',
          move_out_date: formData.inspection_date
        })
        .eq('id', formData.tenant_id);

      if (selectedTenant.bed_id) {
        await supabase
          .from('beds')
          .update({ status: 'Available' })
          .eq('id', selectedTenant.bed_id);
      }

      await supabase
        .from('tenant_settlements')
        .insert([{
          tenant_id: formData.tenant_id,
          security_deposit: securityDeposit,
          damage_charges: formData.total_damage_cost,
          other_deductions: 0,
          refund_amount: refundAmount,
          settlement_date: formData.inspection_date,
          payment_method: 'Pending',
          status: 'Pending'
        }]);

      alert(`Inspection completed!\nDeposit: ₹${securityDeposit}\nDamage Cost: ₹${formData.total_damage_cost}\nRefund: ₹${refundAmount}`);
      setShowModal(false);
      resetForm();
      loadInspections();
      loadActiveTenants();
    } catch (error) {
      console.error('Error creating inspection:', error);
      alert('Error creating inspection');
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_id: '',
      inspection_date: new Date().toISOString().split('T')[0],
      room_condition: '',
      furniture_condition: '',
      cleanliness_rating: 5,
      damages_found: '',
      total_damage_cost: 0,
      notes: ''
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Move-Out Inspections
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Inspect rooms and calculate settlements</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Inspection
        </button>
      </div>

      {tenants.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <ClipboardCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Tenants</h3>
          <p className="text-gray-600 font-semibold">All tenants have been processed</p>
        </div>
      )}

      <div className="grid gap-4">
        {inspections.map((inspection) => (
          <div key={inspection.id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  inspection.status === 'Cleared' ? 'bg-emerald-100' :
                  inspection.status === 'Damages Found' ? 'bg-red-100' :
                  'bg-amber-100'
                }`}>
                  {inspection.status === 'Cleared' ? (
                    <ClipboardCheck className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{inspection.tenant?.name}</h3>
                  <p className="text-sm font-semibold text-gray-600">
                    Tenant ID: {inspection.tenant?.tenant_id} • {new Date(inspection.inspection_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                inspection.status === 'Cleared' ? 'bg-emerald-100 text-emerald-700' :
                inspection.status === 'Damages Found' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {inspection.status}
              </span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
              <div>
                <div className="text-sm font-bold text-gray-600">Security Deposit</div>
                <div className="text-xl font-black text-gray-900">₹{inspection.tenant?.security_deposit || 0}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600">Damage Cost</div>
                <div className="text-xl font-black text-red-600">₹{inspection.total_damage_cost}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600">Deductions</div>
                <div className="text-xl font-black text-amber-600">₹{inspection.deductions}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-gray-600">Refund Amount</div>
                <div className="text-xl font-black text-emerald-600">₹{inspection.refund_amount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">New Move-Out Inspection</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Tenant</label>
                <select
                  required
                  value={formData.tenant_id}
                  onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose tenant to inspect</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.tenant_id} ({t.property?.name}, Room {t.room?.room_number})
                    </option>
                  ))}
                </select>
              </div>

              {formData.tenant_id && (
                <>
                  {(() => {
                    const tenant = tenants.find(t => t.id === formData.tenant_id);
                    return tenant ? (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="font-bold text-gray-600">Phone:</span>
                            <span className="ml-1 font-semibold text-gray-900">{tenant.phone}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600">Security Deposit:</span>
                            <span className="ml-1 font-semibold text-gray-900">₹{tenant.security_deposit}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600">Monthly Rent:</span>
                            <span className="ml-1 font-semibold text-gray-900">₹{tenant.monthly_rent}</span>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Inspection Date</label>
                    <input
                      type="date"
                      required
                      value={formData.inspection_date}
                      onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Room Condition</label>
                      <select
                        required
                        value={formData.room_condition}
                        onChange={(e) => setFormData({ ...formData, room_condition: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Furniture Condition</label>
                      <select
                        required
                        value={formData.furniture_condition}
                        onChange={(e) => setFormData({ ...formData, furniture_condition: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cleanliness Rating (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.cleanliness_rating}
                      onChange={(e) => setFormData({ ...formData, cleanliness_rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Damages Found</label>
                    <textarea
                      value={formData.damages_found}
                      onChange={(e) => setFormData({ ...formData, damages_found: e.target.value })}
                      rows={3}
                      placeholder="List any damages or issues found..."
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Total Damage Cost</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_damage_cost}
                      onChange={(e) => setFormData({ ...formData, total_damage_cost: Number(e.target.value) })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {formData.tenant_id && formData.total_damage_cost >= 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Settlement Preview</h4>
                      {(() => {
                        const tenant = tenants.find(t => t.id === formData.tenant_id);
                        if (!tenant) return null;
                        const deposit = tenant.security_deposit || 0;
                        const refund = Math.max(0, deposit - formData.total_damage_cost);
                        return (
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-xs font-bold text-gray-600">Deposit</div>
                              <div className="text-lg font-black text-gray-900">₹{deposit}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-600">Damages</div>
                              <div className="text-lg font-black text-red-600">₹{formData.total_damage_cost}</div>
                            </div>
                            <div>
                              <div className="text-xs font-bold text-gray-600">Refund</div>
                              <div className="text-lg font-black text-emerald-600">₹{refund}</div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Inspector Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!formData.tenant_id}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Inspection & Process Settlement
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
