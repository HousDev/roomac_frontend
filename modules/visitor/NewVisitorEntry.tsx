import { useEffect, useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle, QrCode, Ban, Loader2, X } from 'lucide-react';

interface BlockedVisitor {
  id: string;
  visitor_name: string;
  visitor_phone: string;
  id_proof_number: string;
  reason: string;
  blocked_by: string;
  blocked_date: string;
  is_active: boolean;
}

interface NewVisitorEntryProps {
  onSuccess?: (visitorData: any) => void;
  onClose?: () => void;
}

export function NewVisitorEntry({ onSuccess, onClose }: NewVisitorEntryProps) {
  const [loading, setLoading] = useState(false);
  const [checkingBlocked, setCheckingBlocked] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [qrCode, setQrCode] = useState('');

  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_phone: '',
    tenant_name: '',
    property_name: '',
    room_number: '',
    purpose: '',
    entry_time: new Date().toISOString().slice(0, 16),
    tentative_exit_time: '',
    vehicle_number: '',
    id_proof_type: 'Aadhaar',
    id_proof_number: '',
    security_guard_name: '',
    approval_status: 'Approved',
    notes: ''
  });

  // Static blocked visitors list
  const staticBlockedVisitors: BlockedVisitor[] = [
    {
      id: '1',
      visitor_name: 'John Doe',
      visitor_phone: '1234567890',
      id_proof_number: 'ABCD1234',
      reason: 'Previous misconduct',
      blocked_by: 'Admin',
      blocked_date: '2026-01-15',
      is_active: true
    },
    {
      id: '2',
      visitor_name: 'Jane Smith',
      visitor_phone: '9876543210',
      id_proof_number: 'XYZ7890',
      reason: 'Theft incident',
      blocked_by: 'Security Manager',
      blocked_date: '2026-02-20',
      is_active: true
    },
    {
      id: '3',
      visitor_name: 'Mike Johnson',
      visitor_phone: '5555555555',
      id_proof_number: 'DEF5678',
      reason: 'Unauthorized entry',
      blocked_by: 'Admin',
      blocked_date: '2026-03-01',
      is_active: true
    }
  ];

  const checkIfBlocked = async () => {
    if (!formData.visitor_phone || !formData.id_proof_number) return;

    setCheckingBlocked(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const blocked = staticBlockedVisitors.find(
        v => v.visitor_phone === formData.visitor_phone &&
          v.id_proof_number === formData.id_proof_number &&
          v.is_active
      );

      if (blocked) {
        setIsBlocked(true);
        setBlockReason(blocked.reason);
        alert(`⚠️ VISITOR BLOCKED!\n\nReason: ${blocked.reason}\nBlocked by: ${blocked.blocked_by}\nDate: ${new Date(blocked.blocked_date).toLocaleDateString()}`);
      } else {
        setIsBlocked(false);
        setBlockReason('');
      }
    } catch (error: any) {
      console.error('Error checking blocked status:', error);
    } finally {
      setCheckingBlocked(false);
    }
  };

  useEffect(() => {
    if (formData.visitor_phone.length === 10 && formData.id_proof_number) {
      checkIfBlocked();
    }
  }, [formData.visitor_phone, formData.id_proof_number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      alert('❌ Cannot register blocked visitor!');
      return;
    }

    if (!formData.security_guard_name) {
      alert('⚠️ Please enter security guard name');
      return;
    }

    if (!formData.visitor_name || !formData.visitor_phone || !formData.tenant_name) {
      alert('⚠️ Please fill all required fields');
      return;
    }

    if (formData.visitor_phone.length !== 10) {
      alert('⚠️ Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const generatedQR = `VIS-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setQrCode(generatedQR);

      const visitorData = {
        ...formData,
        qr_code: generatedQR,
        entry_time: new Date().toISOString()
      };

      if (onSuccess) {
        onSuccess(visitorData);
      } else {
        alert(`✅ Visitor registered successfully!\n\nVisitor: ${formData.visitor_name}\nQR Code: ${generatedQR}\nRoom: ${formData.room_number}\n\nThe visitor can now enter the premises.`);
      }

      resetForm();
    } catch (error: any) {
      console.error('Error creating visitor entry:', error);
      alert('❌ Failed to register visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      visitor_name: '',
      visitor_phone: '',
      tenant_name: '',
      property_name: '',
      room_number: '',
      purpose: '',
      entry_time: new Date().toISOString().slice(0, 16),
      tentative_exit_time: '',
      vehicle_number: '',
      id_proof_type: 'Aadhaar',
      id_proof_number: '',
      security_guard_name: '',
      approval_status: 'Approved',
      notes: ''
    });
    setIsBlocked(false);
    setBlockReason('');
    setQrCode('');
  };

  return (
    <div className="space-y-6">
      {isBlocked && (
        <div className="glass rounded-xl p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
          <div className="flex items-center gap-3">
            <Ban className="w-8 h-8 text-red-600" />
            <div>
              <div className="font-black text-red-900 text-lg">VISITOR BLOCKED</div>
              <div className="text-red-700 font-bold mt-1">Reason: {blockReason}</div>
              <div className="text-red-600 text-sm mt-1">This visitor cannot be registered. Contact management.</div>
            </div>
          </div>
        </div>
      )}

      <div className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Visitor Name *</label>
              <input
                type="text"
                required
                value={formData.visitor_name}
                onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Visitor Phone * {checkingBlocked && <span className="text-blue-600 text-xs">(Checking...)</span>}
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={formData.visitor_phone}
                onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="10-digit mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Name *</label>
              <input
                type="text"
                required
                value={formData.tenant_name}
                onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="Name of person to meet"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Property Name *</label>
              <input
                type="text"
                required
                value={formData.property_name}
                onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="Property name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Room Number *</label>
              <input
                type="text"
                required
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="Room/Flat number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Purpose of Visit *</label>
              <select
                required
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              >
                <option value="">Select purpose</option>
                <option value="Personal Visit">Personal Visit</option>
                <option value="Delivery">Delivery</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Official Meeting">Official Meeting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ID Proof Type *</label>
              <select
                required
                value={formData.id_proof_type}
                onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Driving License">Driving License</option>
                <option value="Voter ID">Voter ID</option>
                <option value="Passport">Passport</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                ID Proof Number * {checkingBlocked && <span className="text-blue-600 text-xs">(Checking...)</span>}
              </label>
              <input
                type="text"
                required
                value={formData.id_proof_number}
                onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="ID proof number"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="e.g., MH01AB1234"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Expected Exit Time</label>
              <input
                type="datetime-local"
                value={formData.tentative_exit_time}
                onChange={(e) => setFormData({ ...formData, tentative_exit_time: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Security Guard Name *</label>
              <input
                type="text"
                required
                value={formData.security_guard_name}
                onChange={(e) => setFormData({ ...formData, security_guard_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                placeholder="Guard on duty"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
              placeholder="Additional notes or special instructions"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || isBlocked}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Register Visitor
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <div className="glass rounded-xl p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <div className="font-bold text-gray-900">Automated Security Features</div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li>✓ Auto-checks visitor against blocked list</li>
              <li>✓ Generates unique QR code for each visitor</li>
              <li>✓ Tracks entry/exit times automatically</li>
              <li>✓ Alerts for overstayed visitors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}