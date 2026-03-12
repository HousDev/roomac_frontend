// import { useEffect, useState } from 'react';
// import { UserPlus, AlertCircle, CheckCircle, QrCode, Ban, Loader2, X } from 'lucide-react';

// interface BlockedVisitor {
//   id: string;
//   visitor_name: string;
//   visitor_phone: string;
//   id_proof_number: string;
//   reason: string;
//   blocked_by: string;
//   blocked_date: string;
//   is_active: boolean;
// }

// interface NewVisitorEntryProps {
//   onSuccess?: (visitorData: any) => void;
//   onClose?: () => void;
// }

// export function NewVisitorEntry({ onSuccess, onClose }: NewVisitorEntryProps) {
//   const [loading, setLoading] = useState(false);
//   const [checkingBlocked, setCheckingBlocked] = useState(false);
//   const [isBlocked, setIsBlocked] = useState(false);
//   const [blockReason, setBlockReason] = useState('');
//   const [qrCode, setQrCode] = useState('');

//   const [formData, setFormData] = useState({
//     visitor_name: '',
//     visitor_phone: '',
//     tenant_name: '',
//     property_name: '',
//     room_number: '',
//     purpose: '',
//     entry_time: new Date().toISOString().slice(0, 16),
//     tentative_exit_time: '',
//     vehicle_number: '',
//     id_proof_type: 'Aadhaar',
//     id_proof_number: '',
//     security_guard_name: '',
//     approval_status: 'Approved',
//     notes: ''
//   });

//   // Static blocked visitors list
//   const staticBlockedVisitors: BlockedVisitor[] = [
//     {
//       id: '1',
//       visitor_name: 'John Doe',
//       visitor_phone: '1234567890',
//       id_proof_number: 'ABCD1234',
//       reason: 'Previous misconduct',
//       blocked_by: 'Admin',
//       blocked_date: '2026-01-15',
//       is_active: true
//     },
//     {
//       id: '2',
//       visitor_name: 'Jane Smith',
//       visitor_phone: '9876543210',
//       id_proof_number: 'XYZ7890',
//       reason: 'Theft incident',
//       blocked_by: 'Security Manager',
//       blocked_date: '2026-02-20',
//       is_active: true
//     },
//     {
//       id: '3',
//       visitor_name: 'Mike Johnson',
//       visitor_phone: '5555555555',
//       id_proof_number: 'DEF5678',
//       reason: 'Unauthorized entry',
//       blocked_by: 'Admin',
//       blocked_date: '2026-03-01',
//       is_active: true
//     }
//   ];

//   const checkIfBlocked = async () => {
//     if (!formData.visitor_phone || !formData.id_proof_number) return;

//     setCheckingBlocked(true);
//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 500));

//       const blocked = staticBlockedVisitors.find(
//         v => v.visitor_phone === formData.visitor_phone &&
//           v.id_proof_number === formData.id_proof_number &&
//           v.is_active
//       );

//       if (blocked) {
//         setIsBlocked(true);
//         setBlockReason(blocked.reason);
//         alert(`⚠️ VISITOR BLOCKED!\n\nReason: ${blocked.reason}\nBlocked by: ${blocked.blocked_by}\nDate: ${new Date(blocked.blocked_date).toLocaleDateString()}`);
//       } else {
//         setIsBlocked(false);
//         setBlockReason('');
//       }
//     } catch (error: any) {
//       console.error('Error checking blocked status:', error);
//     } finally {
//       setCheckingBlocked(false);
//     }
//   };

//   useEffect(() => {
//     if (formData.visitor_phone.length === 10 && formData.id_proof_number) {
//       checkIfBlocked();
//     }
//   }, [formData.visitor_phone, formData.id_proof_number]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (isBlocked) {
//       alert('❌ Cannot register blocked visitor!');
//       return;
//     }

//     if (!formData.security_guard_name) {
//       alert('⚠️ Please enter security guard name');
//       return;
//     }

//     if (!formData.visitor_name || !formData.visitor_phone || !formData.tenant_name) {
//       alert('⚠️ Please fill all required fields');
//       return;
//     }

//     if (formData.visitor_phone.length !== 10) {
//       alert('⚠️ Please enter a valid 10-digit phone number');
//       return;
//     }

//     setLoading(true);

//     try {
//       // Simulate API delay
//       await new Promise(resolve => setTimeout(resolve, 800));

//       const generatedQR = `VIS-${Date.now().toString().slice(-8)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
//       setQrCode(generatedQR);

//       const visitorData = {
//         ...formData,
//         qr_code: generatedQR,
//         entry_time: new Date().toISOString()
//       };

//       if (onSuccess) {
//         onSuccess(visitorData);
//       } else {
//         alert(`✅ Visitor registered successfully!\n\nVisitor: ${formData.visitor_name}\nQR Code: ${generatedQR}\nRoom: ${formData.room_number}\n\nThe visitor can now enter the premises.`);
//       }

//       resetForm();
//     } catch (error: any) {
//       console.error('Error creating visitor entry:', error);
//       alert('❌ Failed to register visitor. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       visitor_name: '',
//       visitor_phone: '',
//       tenant_name: '',
//       property_name: '',
//       room_number: '',
//       purpose: '',
//       entry_time: new Date().toISOString().slice(0, 16),
//       tentative_exit_time: '',
//       vehicle_number: '',
//       id_proof_type: 'Aadhaar',
//       id_proof_number: '',
//       security_guard_name: '',
//       approval_status: 'Approved',
//       notes: ''
//     });
//     setIsBlocked(false);
//     setBlockReason('');
//     setQrCode('');
//   };

//   return (
//     <div className="space-y-6">
//       {isBlocked && (
//         <div className="glass rounded-xl p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300">
//           <div className="flex items-center gap-3">
//             <Ban className="w-8 h-8 text-red-600" />
//             <div>
//               <div className="font-black text-red-900 text-lg">VISITOR BLOCKED</div>
//               <div className="text-red-700 font-bold mt-1">Reason: {blockReason}</div>
//               <div className="text-red-600 text-sm mt-1">This visitor cannot be registered. Contact management.</div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="glass rounded-xl p-6">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Visitor Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.visitor_name}
//                 onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="Full name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">
//                 Visitor Phone * {checkingBlocked && <span className="text-blue-600 text-xs">(Checking...)</span>}
//               </label>
//               <input
//                 type="tel"
//                 required
//                 maxLength={10}
//                 value={formData.visitor_phone}
//                 onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value.replace(/\D/g, '') })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="10-digit mobile number"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Tenant Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.tenant_name}
//                 onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="Name of person to meet"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Property Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.property_name}
//                 onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="Property name"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Room Number *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.room_number}
//                 onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="Room/Flat number"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Purpose of Visit *</label>
//               <select
//                 required
//                 value={formData.purpose}
//                 onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//               >
//                 <option value="">Select purpose</option>
//                 <option value="Personal Visit">Personal Visit</option>
//                 <option value="Delivery">Delivery</option>
//                 <option value="Maintenance">Maintenance</option>
//                 <option value="Official Meeting">Official Meeting</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">ID Proof Type *</label>
//               <select
//                 required
//                 value={formData.id_proof_type}
//                 onChange={(e) => setFormData({ ...formData, id_proof_type: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//               >
//                 <option value="Aadhaar">Aadhaar Card</option>
//                 <option value="PAN">PAN Card</option>
//                 <option value="Driving License">Driving License</option>
//                 <option value="Voter ID">Voter ID</option>
//                 <option value="Passport">Passport</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">
//                 ID Proof Number * {checkingBlocked && <span className="text-blue-600 text-xs">(Checking...)</span>}
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.id_proof_number}
//                 onChange={(e) => setFormData({ ...formData, id_proof_number: e.target.value.toUpperCase() })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="ID proof number"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Vehicle Number</label>
//               <input
//                 type="text"
//                 value={formData.vehicle_number}
//                 onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value.toUpperCase() })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="e.g., MH01AB1234"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Expected Exit Time</label>
//               <input
//                 type="datetime-local"
//                 value={formData.tentative_exit_time}
//                 onChange={(e) => setFormData({ ...formData, tentative_exit_time: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-bold text-gray-700 mb-1">Security Guard Name *</label>
//               <input
//                 type="text"
//                 required
//                 value={formData.security_guard_name}
//                 onChange={(e) => setFormData({ ...formData, security_guard_name: e.target.value })}
//                 className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//                 placeholder="Guard on duty"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               rows={3}
//               className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
//               placeholder="Additional notes or special instructions"
//             />
//           </div>

//           <div className="flex gap-4 pt-4">
//             <button
//               type="submit"
//               disabled={loading || isBlocked}
//               className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Registering...
//                 </>
//               ) : (
//                 <>
//                   <UserPlus className="w-5 h-5" />
//                   Register Visitor
//                 </>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
//             >
//               Clear Form
//             </button>
//           </div>
//         </form>
//       </div>

//       <div className="glass rounded-xl p-5 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
//         <div className="flex items-start gap-3">
//           <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
//           <div>
//             <div className="font-bold text-gray-900">Automated Security Features</div>
//             <ul className="mt-2 space-y-1 text-sm text-gray-700">
//               <li>✓ Auto-checks visitor against blocked list</li>
//               <li>✓ Generates unique QR code for each visitor</li>
//               <li>✓ Tracks entry/exit times automatically</li>
//               <li>✓ Alerts for overstayed visitors</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// components/NewVisitorEntry.tsx
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  UserPlus, Ban, Loader2, Check,
  User, Building, ShieldCheck, StickyNote, Car, X, Search,
} from 'lucide-react';
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createVisitor, checkBlockedStatus, VisitorPayload } from "@/lib/visitorApi";
import { listTenants } from "@/lib/tenantApi";
import { listProperties } from "@/lib/propertyApi";
import { tenantDetailsApi } from "@/lib/tenantDetailsApi";

interface NewVisitorEntryProps {
  onSuccess?: (visitorData: any) => void;
  onClose?: () => void;
}

interface TenantOption   { id: string; name: string; phone: string; email?: string; }
interface PropertyOption { id: string; name: string; }

// Compact styles
const F  = "h-7 text-[10px] rounded-md border-gray-200 focus:border-blue-400 focus:ring-0 bg-gray-50 focus:bg-white transition-colors";
const L  = "block text-[9px] font-semibold text-gray-500 mb-0.5";
const SI = "text-[10px] py-0.5";

const SH = ({ icon, title, color = "text-blue-600" }: { icon: React.ReactNode; title: string; color?: string }) => (
  <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest pb-0.5 mb-1 border-b border-gray-100 ${color}`}>
    {icon}{title}
  </div>
);

const PURPOSES = ['Friend Visit', 'Family', 'Delivery', 'Maintenance', 'Business Meeting', 'Interview', 'Official Work', 'Other'];
const ID_TYPES  = ['Aadhar', 'PAN Card', 'Driving License', 'Voter ID', 'Passport'];

// ── Reusable Searchable Dropdown ─────────────────────────────────────────────
interface SearchDropdownProps<T extends { id: string; name: string }> {
  value: string;
  onChange: (item: T) => void;
  options: T[];
  placeholder?: string;
  renderLabel?: (item: T) => string;
  icon?: React.ReactNode;
}

function SearchDropdown<T extends { id: string; name: string }>({
  value, onChange, options, placeholder = 'Search…', renderLabel, icon,
}: SearchDropdownProps<T>) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const ref               = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);
  const label    = selected ? (renderLabel ? renderLabel(selected) : selected.name) : null;

  const filtered = useMemo(() =>
    options.filter(o =>
      (renderLabel ? renderLabel(o) : o.name)
        .toLowerCase().includes(query.toLowerCase())
    ),
    [options, query]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className={`${F} w-full flex items-center justify-between px-2 text-left`}
      >
        <span className={label ? 'text-gray-800 text-[10px]' : 'text-gray-400 text-[10px]'}>
          {label ?? placeholder}
        </span>
        {icon ?? <Search className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="p-1.5 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Type to search…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-[9px] border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 bg-gray-50"
              />
            </div>
          </div>
          <div className="max-h-36 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-2 py-2 text-[9px] text-gray-400 text-center">No results</div>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o); setOpen(false); setQuery(''); }}
                  className={`w-full flex items-center gap-1 px-2 py-1.5 text-[9px] hover:bg-blue-50 text-left transition-colors
                    ${value === o.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                >
                  <span className="flex-1 truncate">
                    {renderLabel ? renderLabel(o) : o.name}
                  </span>
                  {value === o.id && <Check className="h-2.5 w-2.5 flex-shrink-0 text-blue-600" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export function NewVisitorEntry({ onSuccess, onClose }: NewVisitorEntryProps) {
  const [tenants, setTenants]       = useState<TenantOption[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(false);
  const [isBlocked, setIsBlocked]   = useState(false);
  const [blockInfo, setBlockInfo]   = useState<any>(null);

  const emptyForm = {
    tenant_id: '', tenant_name: '', tenant_phone: '', tenant_email: '',
    property_id: '', property_name: '', room_number: '',
    visitor_name: '', visitor_phone: '',
    entry_time: new Date().toISOString().slice(0, 16),
    tentative_exit_time: '',
    purpose: '', id_proof_type: 'Aadhar', id_proof_number: '',
    vehicle_number: '', approval_status: 'Approved',
    security_guard_name: '', notes: '',
  };
  const [form, setForm] = useState(emptyForm);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const [tRes, pRes] = await Promise.all([
          listTenants({ is_active: true }),
          listProperties({ is_active: true }),
        ]);
        const tList = tRes?.data || [];
        setTenants((Array.isArray(tList) ? tList : []).map((t: any) => ({
          id: String(t.id), name: t.full_name || '', phone: t.phone || '', email: t.email || '',
        })));
        const pList = pRes?.data?.data || pRes?.data || [];
        setProperties((Array.isArray(pList) ? pList : Object.values(pList)).map((p: any) => ({
          id: String(p.id), name: p.name,
        })));
      } catch (err) {
        console.error('Failed to load tenants/properties:', err);
      }
    })();
  }, []);

  const handleTenantSelect = async (tenant: TenantOption) => {
    setForm(p => ({
      ...p,
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      tenant_phone: tenant.phone,
      tenant_email: tenant.email || '',
    }));
    try {
      const res = await tenantDetailsApi.getProfileById(tenant.id);
      const d = res?.data;
      if (!d) return;
      setForm(p => ({
        ...p,
        property_id:   String(d.property_id || ''),
        property_name: d.property_name || '',
        room_number:   d.room_number || '',
      }));
    } catch (err) {
      console.error('Could not fetch tenant details:', err);
    }
  };

  const checkBlocked = useCallback(async (phone: string, proof: string) => {
    if (!phone || phone.length < 10 || !proof) return;
    setChecking(true);
    try {
      const res = await checkBlockedStatus(phone, proof);
      setIsBlocked(res.is_blocked);
      setBlockInfo(res.data);
      if (res.is_blocked) toast.error(`Visitor is BLOCKED — ${res.data?.reason}`);
    } catch { /* silent */ }
    finally { setChecking(false); }
  }, []);

  useEffect(() => {
    if (form.visitor_phone.length === 10 && form.id_proof_number.length >= 4) {
      checkBlocked(form.visitor_phone, form.id_proof_number);
    } else {
      setIsBlocked(false);
      setBlockInfo(null);
    }
  }, [form.visitor_phone, form.id_proof_number]);

  const handleSubmit = async () => {
    if (isBlocked) { toast.error('Cannot register a blocked visitor'); return; }

    if (!form.visitor_name) { toast.error('Visitor name required'); return; }
    if (!form.visitor_phone || form.visitor_phone.length !== 10) { toast.error('Valid 10-digit phone required'); return; }
    if (!form.tenant_name) { toast.error('Tenant name required'); return; }
    if (!form.property_name) { toast.error('Property name required'); return; }
    if (!form.room_number) { toast.error('Room number required'); return; }
    if (!form.purpose) { toast.error('Purpose required'); return; }
    if (!form.id_proof_type) { toast.error('ID proof type required'); return; }
    if (!form.id_proof_number) { toast.error('ID proof number required'); return; }
    if (!form.security_guard_name) { toast.error('Security guard name required'); return; }

    setLoading(true);
    try {
      const payload: VisitorPayload = {
        tenant_id:           form.tenant_id || undefined,
        tenant_name:         form.tenant_name,
        tenant_phone:        form.tenant_phone,
        tenant_email:        form.tenant_email,
        property_id:         form.property_id || undefined,
        property_name:       form.property_name,
        room_number:         form.room_number,
        visitor_name:        form.visitor_name,
        visitor_phone:       form.visitor_phone,
        entry_time:          form.entry_time,
        tentative_exit_time: form.tentative_exit_time || undefined,
        purpose:             form.purpose,
        id_proof_type:       form.id_proof_type,
        id_proof_number:     form.id_proof_number,
        vehicle_number:      form.vehicle_number || undefined,
        approval_status:     form.approval_status,
        security_guard_name: form.security_guard_name,
        notes:               form.notes || undefined,
      };

      const res = await createVisitor(payload);
      toast.success(`Visitor registered! QR: ${res.data?.qr_code || '—'}`);
      if (onSuccess) onSuccess(res.data);
      setForm(emptyForm);
    } catch (err: any) {
      if (err?.blocked) {
        setIsBlocked(true);
        setBlockInfo(err);
        toast.error(`Blocked: ${err.reason}`);
      } else {
        toast.error(err?.message || 'Failed to register visitor');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Blocked banner */}
      {isBlocked && blockInfo && (
        <div className="rounded-lg p-2 bg-red-50 border border-red-200 flex items-start gap-1.5">
          <Ban className="h-3.5 w-3.5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[9px] font-bold text-red-800">VISITOR BLOCKED</p>
            <p className="text-[8px] text-red-700">Reason: {blockInfo.reason}</p>
            {blockInfo.blocked_by && <p className="text-[8px] text-red-600">By: {blockInfo.blocked_by}</p>}
          </div>
        </div>
      )}

      {/* Visitor Info - Desktop 3x3, Mobile 2x2 */}
      <div>
        <SH icon={<User className="h-2.5 w-2.5" />} title="Visitor Info" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Visitor Name *</label>
            <Input className={F} placeholder="Full name"
              value={form.visitor_name} onChange={e => set('visitor_name', e.target.value)} />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>
              Visitor Phone *
              {checking && <span className="text-blue-500 ml-1">(checking…)</span>}
            </label>
            <Input className={F} placeholder="10-digit" maxLength={10}
              value={form.visitor_phone}
              onChange={e => set('visitor_phone', e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Entry Time *</label>
            <Input type="datetime-local" className={F}
              value={form.entry_time}
              onChange={e => set('entry_time', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Host & Property - Desktop 3x3, Mobile 2x2 */}
      <div>
        <SH icon={<Building className="h-2.5 w-2.5" />} title="Host & Property" color="text-indigo-600" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Select Tenant</label>
            <SearchDropdown<TenantOption>
              value={form.tenant_id}
              onChange={handleTenantSelect}
              options={tenants}
              placeholder="Search tenant…"
              renderLabel={t => `${t.name} — ${t.phone}`}
              icon={<User className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />}
            />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Tenant Name *</label>
            <Input className={F} placeholder="Auto-filled"
              value={form.tenant_name} onChange={e => set('tenant_name', e.target.value)} />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Tenant Phone</label>
            <Input className={F} placeholder="Auto-filled"
              value={form.tenant_phone} onChange={e => set('tenant_phone', e.target.value)} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Property *</label>
            <SearchDropdown<PropertyOption>
              value={form.property_id}
              onChange={p => setForm(f => ({ ...f, property_id: p.id, property_name: p.name }))}
              options={properties}
              placeholder="Search property…"
              icon={<Building className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />}
            />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Room Number *</label>
            <Input className={F} placeholder="e.g. 101"
              value={form.room_number} onChange={e => set('room_number', e.target.value)} />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Expected Exit</label>
            <Input type="datetime-local" className={F}
              value={form.tentative_exit_time}
              onChange={e => set('tentative_exit_time', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ID Verification - Desktop 3x3, Mobile 2x2 */}
      <div>
        <SH icon={<ShieldCheck className="h-2.5 w-2.5" />} title="ID Verification" color="text-purple-600" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>ID Type *</label>
            <Select value={form.id_proof_type} onValueChange={v => set('id_proof_type', v)}>
              <SelectTrigger className={F}><SelectValue /></SelectTrigger>
              <SelectContent>{ID_TYPES.map(t => <SelectItem key={t} value={t} className={SI}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>ID Number *</label>
            <Input className={F} placeholder="ID number"
              value={form.id_proof_number}
              onChange={e => set('id_proof_number', e.target.value.toUpperCase())} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Purpose *</label>
            <Select value={form.purpose} onValueChange={v => set('purpose', v)}>
              <SelectTrigger className={F}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p} className={SI}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Vehicle & Security - Desktop 3x3, Mobile 2x2 */}
      <div>
        <SH icon={<Car className="h-2.5 w-2.5" />} title="Vehicle & Security" color="text-amber-600" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="col-span-2 sm:col-span-1">
            <label className={L}>Vehicle Number</label>
            <Input className={F} placeholder="MH01AB1234"
              value={form.vehicle_number}
              onChange={e => set('vehicle_number', e.target.value.toUpperCase())} />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Security Guard *</label>
            <Input className={F} placeholder="Guard name"
              value={form.security_guard_name}
              onChange={e => set('security_guard_name', e.target.value)} />
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={L}>Approval</label>
            <Select value={form.approval_status} onValueChange={v => set('approval_status', v)}>
              <SelectTrigger className={F}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <label className={L}>Notes</label>
            <Textarea
              className="text-[9px] rounded-md border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-0 min-h-[32px] resize-none"
              rows={1} placeholder="Additional notes…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Footer buttons - Fixed at bottom */}
      <div className="flex gap-2 pt-1 border-t border-gray-100 mt-2">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}
            className="h-7 text-[9px] px-3 flex-1">
            Cancel
          </Button>
        )}
        <Button
          disabled={loading || isBlocked}
          onClick={handleSubmit}
          className="flex-1 h-7 text-[9px] font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg shadow-sm flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="h-2.5 w-2.5 animate-spin" />Registering…</>
          ) : (
            <><UserPlus className="h-2.5 w-2.5" /> Register Visitor</>
          )}
        </Button>
      </div>
    </div>
  );
}