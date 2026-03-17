



// components/tenant/profile/PersonalInfoTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  User, Mail, Phone, Calendar, Briefcase,
  AlertCircle, MapPin, Building, Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile, TenantFormData } from '@/lib/tenantDetailsApi';

interface PersonalInfoTabProps {
  profile: TenantProfile;
  editing: boolean;
  formData: TenantFormData;
  errors: Record<string, string>;
  loading: boolean;
  age: number | null;
  isMobile?: boolean;
  onFieldChange: (field: keyof TenantFormData, value: string) => void;
}

// Reusable read-only row (desktop)
const InfoRow = ({
  label, value, last = false
}: { label: string; value: string; last?: boolean }) => (
  <div className={`flex justify-between py-2.5 ${!last ? 'border-b border-slate-100' : ''}`}>
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{value || '—'}</span>
  </div>
);

export default function PersonalInfoTab({
  profile,
  editing,
  formData,
  errors,
  loading,
  age,
  isMobile = false,
  onFieldChange,
}: PersonalInfoTabProps) {

  const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
  const OCC_OPTIONS = ['Service', 'Business', 'Student', 'Other'];
  const REL_OPTIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Friend', 'Relative', 'Guardian', 'Other'];

  // ── MOBILE VIEW ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3">

        {/* Basic Information */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Basic Information</span>
          </div>
          <div className="p-3 space-y-2.5">

            {/* Full Name — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Full Name</p>
              <p className="text-sm font-medium text-slate-800">{profile.full_name}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Email — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-xs text-slate-700 truncate">{profile.email}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Phone — locked */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Phone</p>
              <p className="text-xs font-medium text-slate-800">{profile.country_code} {profile.phone}</p>
              <p className="text-[9px] text-slate-400">Cannot be changed</p>
            </div>

            {/* Gender + DOB side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                { (
                  <p className="text-xs font-medium text-slate-800">{profile.gender || '—'}</p>
                )}
                {errors.gender && <p className="text-[10px] text-red-500 mt-0.5">{errors.gender}</p>}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                {(
                  <p className="text-xs font-medium text-slate-800">
                    {profile.date_of_birth ? format(parseISO(profile.date_of_birth), 'dd MMM yyyy') : '—'}
                    {age && <span className="text-slate-400 ml-1">({age}y)</span>}
                  </p>
                )}
                {errors.date_of_birth && <p className="text-[10px] text-red-500 mt-0.5">{errors.date_of_birth}</p>}
              </div>
            </div>

          </div>
        </div>

        {/* Occupation */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Occupation</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Category</p>
                {editing ? (
                  <Select value={formData.occupation_category} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{OCC_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.occupation_category || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Occupation</p>
                {editing ? (
                  <Input value={formData.occupation} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} className={`h-8 text-xs ${errors.occupation ? 'border-red-500' : ''}`} placeholder="Profession" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.occupation || '—'}</p>
                )}
                {errors.occupation && <p className="text-[10px] text-red-500 mt-0.5">{errors.occupation}</p>}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Details</p>
              {editing ? (
                <Textarea value={formData.exact_occupation} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} className="text-xs" placeholder="Job title, company..." />
              ) : (
                <p className="text-xs text-slate-700">{profile.exact_occupation || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Emergency Contact</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Name</p>
                {editing ? (
                  <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} className="h-8 text-xs" placeholder="Contact name" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_name || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                {editing ? (
                  <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} className="h-8 text-xs" placeholder="Contact phone" />
                ) : (
                  <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_phone || '—'}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Relationship</p>
              {editing ? (
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <p className="text-xs font-medium text-slate-800">{profile.emergency_contact_relation || '—'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Permanent Address</span>
          </div>
          <div className="p-3 space-y-2.5">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Address</p>
              {editing ? (
                <Textarea value={formData.address} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} className={`text-xs ${errors.address ? 'border-red-500' : ''}`} placeholder="Complete address" />
              ) : (
                <p className="text-xs text-slate-700">{profile.address || '—'}</p>
              )}
              {errors.address && <p className="text-[10px] text-red-500 mt-0.5">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['city', 'state', 'pincode'] as const).map(f => (
                <div key={f}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 capitalize">{f}</p>
                  {editing ? (
                    <Input value={formData[f] as string} onChange={e => onFieldChange(f, e.target.value)} disabled={loading} className={`h-8 text-xs ${errors[f] ? 'border-red-500' : ''}`} />
                  ) : (
                    <p className="text-xs font-medium text-slate-800">{(profile as any)[f] || '—'}</p>
                  )}
                  {errors[f] && <p className="text-[10px] text-red-500 mt-0.5">{errors[f]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    );
  }

  // ── DESKTOP VIEW — minimal, matches portal page right-column card style ────
  return (
    <div className="space-y-4">

      {/* Basic Information */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          {/* Read-only locked fields */}
          <InfoRow label="Full Name" value={profile.full_name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={`${profile.country_code || ''} ${profile.phone || ''}`} />

          {/* Editable fields */}
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Gender</span>
            { (
              <span className="text-sm font-medium text-slate-900">{profile.gender || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Date of Birth</span>
            { (
              <span className="text-sm font-medium text-slate-900">
                {profile.date_of_birth ? format(parseISO(profile.date_of_birth), 'dd MMM yyyy') : '—'}
                {age && <span className="text-slate-400 ml-1.5 text-xs">({age} years)</span>}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Occupation */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-slate-400" />
            Occupation Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Category</span>
            {editing ? (
              <div className="w-48">
                <Select value={formData.occupation_category} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{OCC_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.occupation_category || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Occupation</span>
            {editing ? (
              <div className="w-48">
                <Input value={formData.occupation} onChange={e => onFieldChange('occupation', e.target.value)} disabled={loading} placeholder="Your profession" className={`h-9 text-sm ${errors.occupation ? 'border-red-500' : ''}`} />
                {errors.occupation && <p className="text-xs text-red-500 mt-1">{errors.occupation}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.occupation || '—'}</span>
            )}
          </div>

          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Exact Details</span>
            {editing ? (
              <div className="w-64">
                <Textarea value={formData.exact_occupation} onChange={e => onFieldChange('exact_occupation', e.target.value)} disabled={loading} rows={2} placeholder="Job title, company..." className="text-sm" />
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{profile.exact_occupation || '—'}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-400" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Name</span>
            {editing ? (
              <Input value={formData.emergency_contact_name || ''} onChange={e => onFieldChange('emergency_contact_name', e.target.value)} disabled={loading} placeholder="Contact name" className="w-48 h-9 text-sm" />
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_name || '—'}</span>
            )}
          </div>
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Phone</span>
            {editing ? (
              <Input value={formData.emergency_contact_phone || ''} onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} disabled={loading} maxLength={10} placeholder="Contact phone" className="w-48 h-9 text-sm" />
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_phone || '—'}</span>
            )}
          </div>
          <div className={`flex justify-between py-2.5 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Relationship</span>
            {editing ? (
              <div className="w-48">
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{REL_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900">{profile.emergency_contact_relation || '—'}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-2 px-5">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            Permanent Address
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5">
          <div className={`flex justify-between py-2.5 border-b border-slate-100 ${editing ? 'items-start' : 'items-center'}`}>
            <span className="text-sm text-slate-500">Address</span>
            {editing ? (
              <div className="w-64">
                <Textarea value={formData.address} onChange={e => onFieldChange('address', e.target.value)} disabled={loading} rows={2} placeholder="Complete address" className={`text-sm ${errors.address ? 'border-red-500' : ''}`} />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">{profile.address || '—'}</span>
            )}
          </div>
          {(['city', 'state', 'pincode'] as const).map((f, i, arr) => (
            <div key={f} className={`flex justify-between py-2.5 ${i < arr.length - 1 ? 'border-b border-slate-100' : ''} ${editing ? 'items-start' : 'items-center'}`}>
              <span className="text-sm text-slate-500 capitalize">{f}</span>
              {editing ? (
                <div className="w-48">
                  <Input value={formData[f] as string} onChange={e => onFieldChange(f, e.target.value)} disabled={loading} className={`h-9 text-sm ${errors[f] ? 'border-red-500' : ''}`} />
                  {errors[f] && <p className="text-xs text-red-500 mt-1">{errors[f]}</p>}
                </div>
              ) : (
                <span className="text-sm font-medium text-slate-900">{(profile as any)[f] || '—'}</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}