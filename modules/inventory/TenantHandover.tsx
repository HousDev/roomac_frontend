import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Upload, FileText } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { TenantHandover as TenantHandoverType, Asset } from '../../types/inventory';

export function TenantHandover() {
  const [handovers, setHandovers] = useState<TenantHandoverType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    tenant_name: '',
    tenant_id: '',
    property_name: '',
    room_number: '',
    bed_number: '',
    move_in_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    aadhaar_number: ''
  });

  useEffect(() => {
    loadHandovers();
    loadAvailableAssets();
  }, []);

  const loadHandovers = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_handovers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHandovers(data || []);
    } catch (error) {
      console.error('Error loading handovers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*, item:inventory_items(name)')
        .eq('status', 'In Stock');

      if (error) throw error;
      setAvailableAssets(data || []);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: handoverData, error: handoverError } = await supabase
        .from('tenant_handovers')
        .insert([{
          ...formData,
          status: 'Pending',
          handover_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (handoverError) throw handoverError;

      for (const assetId of selectedAssets) {
        const asset = availableAssets.find(a => a.id === assetId);
        if (!asset) continue;

        await supabase.from('handover_items').insert([{
          handover_id: handoverData.id,
          asset_id: assetId,
          condition: asset.condition,
          tenant_confirmed: false
        }]);

        await supabase
          .from('assets')
          .update({ status: 'Allocated' })
          .eq('id', assetId);
      }

      alert('Handover created successfully!');
      setShowModal(false);
      resetForm();
      loadHandovers();
      loadAvailableAssets();
    } catch (error) {
      console.error('Error creating handover:', error);
      alert('Error creating handover');
    }
  };

  const completeHandover = async (id: string) => {
    try {
      const aadhaarOTP = prompt('Enter Aadhaar OTP for e-signature:');
      if (!aadhaarOTP) return;

      const { error } = await supabase
        .from('tenant_handovers')
        .update({
          status: 'Completed',
          tenant_signature: `ESIGN-${Date.now()}`,
          esign_timestamp: new Date().toISOString(),
          esign_ip: '127.0.0.1'
        })
        .eq('id', id);

      if (error) throw error;

      alert('Handover completed with e-signature!');
      loadHandovers();
    } catch (error) {
      console.error('Error completing handover:', error);
      alert('Error completing handover');
    }
  };

  const resetForm = () => {
    setFormData({
      tenant_name: '',
      tenant_id: '',
      property_name: '',
      room_number: '',
      bed_number: '',
      move_in_date: new Date().toISOString().split('T')[0],
      inspector_name: '',
      aadhaar_number: ''
    });
    setSelectedAssets([]);
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-600 font-semibold">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Tenant Handover
          </h1>
          <p className="text-gray-600 font-semibold mt-1">Manage move-in handovers with e-signature</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          New Handover
        </button>
      </div>

      <div className="grid gap-4">
        {handovers.map((handover) => (
          <div key={handover.id} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900">{handover.tenant_name}</h3>
                <p className="text-sm font-semibold text-gray-600">
                  {handover.property_name} - Room {handover.room_number}
                  {handover.bed_number && ` / Bed ${handover.bed_number}`}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                handover.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {handover.status}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">Tenant ID</p>
                <p className="text-sm font-semibold text-gray-900">{handover.tenant_id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">Move-In Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(handover.move_in_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">Inspector</p>
                <p className="text-sm font-semibold text-gray-900">{handover.inspector_name}</p>
              </div>
              {handover.esign_timestamp && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">E-Signed At</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(handover.esign_timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            {handover.status === 'Pending' && (
              <button
                onClick={() => completeHandover(handover.id)}
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete with E-Signature
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Create Handover</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tenant ID</label>
                  <input
                    type="text"
                    required
                    value={formData.tenant_id}
                    onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={formData.bed_number}
                    onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Move-In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Inspector Name</label>
                  <input
                    type="text"
                    required
                    value={formData.inspector_name}
                    onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    required
                    value={formData.aadhaar_number}
                    onChange={(e) => setFormData({ ...formData, aadhaar_number: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Assets to Allocate</label>
                <div className="max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 space-y-2">
                  {availableAssets.map((asset) => (
                    <label
                      key={asset.id}
                      className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssets.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{asset.asset_id}</p>
                        <p className="text-xs font-semibold text-gray-600">
                          Room {asset.room_number} - {asset.condition}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={selectedAssets.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Handover
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
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
