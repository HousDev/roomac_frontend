import { useEffect, useState } from 'react';
import { UserPlus, Send, CheckCircle, Car, Phone, FileText } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

interface Property {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  name: string;
  tenant_id: string;
  phone: string;
  room?: { room_number: string };
  property?: { name: string };
}

interface Purpose {
  id: string;
  name: string;
  description: string;
}

export function NewVisitorEntry() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [purposes, setPurposes] = useState<Purpose[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    property_id: '',
    tenant_id: '',
    purpose: '',
    tentative_exit_time: '',
    vehicle_type: '',
    vehicle_number: '',
    document_type: '',
    document_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    otp_input: '',
    notes: ''
  });

  useEffect(() => {
    loadProperties();
    loadPurposes();
  }, []);

  useEffect(() => {
    if (formData.property_id) {
      loadTenantsByProperty(formData.property_id);
    }
  }, [formData.property_id]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const loadTenantsByProperty = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, room:rooms(room_number), property:properties(name)')
        .eq('property_id', propertyId)
        .eq('status', 'Active')
        .order('name');
      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error('Error loading tenants:', error);
    }
  };

  const loadPurposes = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_purposes')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      setPurposes(data || []);
    } catch (error) {
      console.error('Error loading purposes:', error);
    }
  };

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    if (!formData.tenant_id) {
      alert('Please select a tenant first');
      return;
    }

    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpSent(true);

    const tenant = tenants.find(t => t.id === formData.tenant_id);
    alert(`OTP sent to ${tenant?.name} (${tenant?.phone})\n\nDemo OTP: ${otp}\n\nIn production, this would be sent via SMS.`);
  };

  const handleVerifyOTP = () => {
    if (formData.otp_input === generatedOtp) {
      setOtpVerified(true);
      alert('OTP Verified Successfully!');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpVerified) {
      alert('Please verify OTP before submitting');
      return;
    }

    setLoading(true);
    try {
      const tenant = tenants.find(t => t.id === formData.tenant_id);
      if (!tenant) throw new Error('Tenant not found');

      const { error } = await supabase
        .from('visitor_logs')
        .insert([{
          visitor_name: formData.visitor_name,
          visitor_phone: formData.visitor_phone,
          tenant_uuid: formData.tenant_id,
          tenant_name: tenant.name,
          tenant_id: tenant.tenant_id,
          room_number: tenant.room?.room_number || '',
          property_uuid: formData.property_id,
          entry_time: new Date().toISOString(),
          tentative_exit_time: formData.tentative_exit_time ? new Date(formData.tentative_exit_time).toISOString() : null,
          purpose: formData.purpose,
          vehicle_type: formData.vehicle_type || null,
          vehicle_number: formData.vehicle_number || null,
          document_type: formData.document_type || null,
          document_url: formData.document_number || null,
          emergency_contact_name: formData.emergency_contact_name || null,
          emergency_contact_phone: formData.emergency_contact_phone || null,
          approval_otp: generatedOtp,
          approval_status: 'Approved',
          otp_verified_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          entry_status: 'Checked-In',
          security_guard_name: 'Security',
          notes: formData.notes
        }]);

      if (error) throw error;

      alert('Visitor entry created successfully!');
      resetForm();
    } catch (error) {
      console.error('Error creating visitor entry:', error);
      alert('Error creating visitor entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      visitor_name: '',
      visitor_phone: '',
      property_id: '',
      tenant_id: '',
      purpose: '',
      tentative_exit_time: '',
      vehicle_type: '',
      vehicle_number: '',
      document_type: '',
      document_number: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      otp_input: '',
      notes: ''
    });
    setOtpSent(false);
    setOtpVerified(false);
    setGeneratedOtp('');
    setTenants([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          New Visitor Entry
        </h1>
        <p className="text-gray-600 font-semibold mt-1">Register a new visitor with OTP verification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Visitor Information
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Visitor Name *</label>
              <input
                type="text"
                required
                value={formData.visitor_name}
                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                placeholder="Enter visitor name"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Visitor Phone *</label>
              <input
                type="tel"
                required
                value={formData.visitor_phone}
                onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                placeholder="10-digit phone number"
                pattern="[0-9]{10}"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4">Tenant Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Property *</label>
              <select
                required
                value={formData.property_id}
                onChange={(e) => setFormData({ ...formData, property_id: e.target.value, tenant_id: '' })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Property</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tenant to Visit *</label>
              <select
                required
                value={formData.tenant_id}
                onChange={(e) => setFormData({ ...formData, tenant_id: e.target.value })}
                disabled={!formData.property_id}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - Room {t.room?.room_number} ({t.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Visit & Document Details
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Purpose of Visit *</label>
              <select
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Purpose</option>
                {purposes.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Expected Exit Time</label>
              <input
                type="datetime-local"
                value={formData.tentative_exit_time}
                onChange={(e) => setFormData({ ...formData, tentative_exit_time: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Document Type</label>
              <select
                value={formData.document_type}
                onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Document</option>
                <option value="Aadhar">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Passport">Passport</option>
                <option value="Voter ID">Voter ID</option>
              </select>
            </div>
            {formData.document_type && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Document Number</label>
                <input
                  type="text"
                  value={formData.document_number}
                  onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  placeholder="Enter document number"
                />
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Information (Optional)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Type</label>
              <select
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="">No Vehicle</option>
                <option value="Two Wheeler">Two Wheeler</option>
                <option value="Four Wheeler">Four Wheeler</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>
            {formData.vehicle_type && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                  placeholder="MH01AB1234"
                />
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Emergency Contact (Optional)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                placeholder="Emergency contact person"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
                placeholder="Emergency phone number"
                pattern="[0-9]{10}"
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5" />
            OTP Verification
          </h2>

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={!formData.tenant_id}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send OTP to Tenant
            </button>
          )}

          {otpSent && !otpVerified && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={formData.otp_input}
                  onChange={(e) => setFormData({ ...formData, otp_input: e.target.value })}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="flex-1 px-3 py-2 border-2 border-blue-300 rounded-lg font-bold text-lg text-center focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all"
                >
                  Verify
                </button>
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </div>
          )}

          {otpVerified && (
            <div className="flex items-center gap-3 p-4 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <div className="text-sm font-bold text-emerald-700">OTP Verified Successfully</div>
                <div className="text-xs font-semibold text-emerald-600">Tenant has approved the visit</div>
              </div>
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-6">
          <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-semibold focus:outline-none focus:border-blue-500"
            placeholder="Any additional information..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Entry...' : 'Create Visitor Entry'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-all"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
