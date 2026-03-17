

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
  AlertCircle, MapPin, Building, Users, Heart, Shield, Home,
  PenLine, Lock, Hash, Award
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

// Helper function to safely get last 6 characters of ID
const getDisplayId = (id: string | number | undefined): string => {
  if (!id) return 'N/A';
  const idStr = String(id); // Convert to string safely
  return idStr.length > 6 ? idStr.slice(-6) : idStr;
};

// Reusable read-only row (desktop) - enhanced with logo colors
const InfoRow = ({
  label, value, last = false, icon: Icon, badge
}: { 
  label: string; 
  value: string; 
  last?: boolean;
  icon?: any;
  badge?: string;
}) => (
  <div className={`group flex items-start justify-between py-3 px-1 ${!last ? 'border-b border-slate-100' : ''} hover:bg-[#f0f5ff] transition-colors duration-150 rounded-lg`}>
    <div className="flex items-center gap-2 text-slate-500">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#004aad]" />}
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
    </div>
    <div className="flex items-center gap-2 max-w-[60%]">
      {badge && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-[#ffc107] text-[#004aad] bg-[#fff9e6]">{badge}</Badge>}
      <span className="text-sm font-semibold text-slate-800 text-right break-words">{value || '—'}</span>
    </div>
  </div>
);

// Section Header Component with logo colors
const SectionHeader = ({ icon: Icon, title, color = "blue" }: { icon: any; title: string; color?: string }) => {
  const getBgColor = () => {
    switch(color) {
      case 'blue': return 'bg-[#e6f0ff]';
      case 'gold': return 'bg-[#fff9e6]';
      case 'rose': return 'bg-rose-50';
      case 'emerald': return 'bg-emerald-50';
      default: return 'bg-[#e6f0ff]';
    }
  };

  const getTextColor = () => {
    switch(color) {
      case 'blue': return 'text-[#004aad]';
      case 'gold': return 'text-[#ffc107]';
      default: return 'text-[#004aad]';
    }
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className={`p-2 ${getBgColor()} rounded-lg`}>
        <Icon className={`h-4 w-4 ${getTextColor()}`} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Personal details & preferences</p>
      </div>
    </div>
  );
};

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

  // Safely format display values
  const displayId = getDisplayId(profile.id);
  const displayName = profile.full_name || '—';
  const displayEmail = profile.email || '—';
  const displayPhone = `${profile.country_code || ''} ${profile.phone || ''}`.trim() || '—';
  const displayGender = profile.gender || '—';
  const displayDob = profile.date_of_birth 
    ? (() => { try { return format(parseISO(profile.date_of_birth), 'dd MMM yyyy'); } catch { return profile.date_of_birth; } })()
    : '—';

  // ── MOBILE VIEW - Enhanced with logo colors ─────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3 pb-4">
        
        {/* Profile Summary Card - Blue gradient */}
        <div className="bg-gradient-to-br from-[#004aad] via-[#004aad] to-[#002a7a] rounded-xl p-4 border border-[#004aad]/20 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg">
              <User className="h-6 w-6 text-[#004aad]" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">{displayName}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-[9px] px-1.5 py-0">
                  <Hash className="h-2 w-2 inline mr-0.5" />
                  {displayId}
                </Badge>
                {/* {age && (
                  <Badge className="bg-[#ffc107] text-[#004aad] border-none text-[9px] px-1.5 py-0">
                    <Award className="h-2 w-2 inline mr-0.5" />
                    {age} years
                  </Badge>
                )} */}
              </div>
            </div>
          </div>
          
          {/* Quick Info Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {profile.gender && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <User className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.gender}</span>
              </div>
            )}
            {profile.occupation_category && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.occupation_category}</span>
              </div>
            )}
            {profile.city && (
              <div className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[#ffc107]" />
                <span className="text-[10px] font-medium text-white">{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#004aad] rounded-lg shadow-sm">
                <User className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Basic Information</span>
            </div>
          </div>
          <div className="p-4 space-y-3">

            {/* Full Name — locked */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Full Name</p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-sm font-bold text-slate-800">{displayName}</p>
            </div>

            {/* Email — locked */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Email</p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-xs text-slate-700 truncate">{displayEmail}</p>
            </div>

            {/* Phone — locked */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Phone</p>
                <Lock className="h-2.5 w-2.5 text-[#004aad]/30" />
              </div>
              <p className="text-sm font-bold text-slate-800">{displayPhone}</p>
            </div>

            {/* Gender + DOB side by side */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <p className="text-[9px] font-medium text-[#004aad] uppercase tracking-wider mb-1">Gender</p>
                <p className="text-sm font-bold text-slate-800">{displayGender}</p>
                {errors.gender && <p className="text-[9px] text-red-500 mt-1">{errors.gender}</p>}
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                <p className="text-[9px] font-medium text-[#ffc107] uppercase tracking-wider mb-1">Date of Birth</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-sm font-bold text-slate-800">{displayDob}</p>
                  {age && <span className="text-[9px] text-slate-400">({age}y)</span>}
                </div>
                {errors.date_of_birth && <p className="text-[9px] text-red-500 mt-1">{errors.date_of_birth}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Occupation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ffc107] rounded-lg shadow-sm">
                <Briefcase className="h-3.5 w-3.5 text-[#004aad]" />
              </div>
              <span className="text-xs font-bold text-[#004aad] uppercase tracking-wider">Occupation</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Category</p>
                {editing ? (
                  <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                    <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCC_OPTIONS.map(o => (
                        <SelectItem key={o} value={o} className="text-sm">{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {profile.occupation_category || '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Occupation</p>
                {editing ? (
                  <Input 
                    value={formData.occupation || ''} 
                    onChange={e => onFieldChange('occupation', e.target.value)} 
                    disabled={loading} 
                    className={`h-9 text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] ${errors.occupation ? 'border-red-300 focus:ring-red-200' : ''}`} 
                    placeholder="Profession" 
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {profile.occupation || '—'}
                  </p>
                )}
                {errors.occupation && <p className="text-[9px] text-red-500 mt-1">{errors.occupation}</p>}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Details</p>
              {editing ? (
                <Textarea 
                  value={formData.exact_occupation || ''} 
                  onChange={e => onFieldChange('exact_occupation', e.target.value)} 
                  disabled={loading} 
                  rows={2} 
                  className="text-sm border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]" 
                  placeholder="Job title, company..." 
                />
              ) : (
                <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 min-h-[60px]">
                  {profile.exact_occupation || '—'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500 rounded-lg shadow-sm">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Emergency Contact</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Name</p>
                {editing ? (
                  <Input 
                    value={formData.emergency_contact_name || ''} 
                    onChange={e => onFieldChange('emergency_contact_name', e.target.value)} 
                    disabled={loading} 
                    className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200" 
                    placeholder="Contact name" 
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {profile.emergency_contact_name || '—'}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                {editing ? (
                  <Input 
                    value={formData.emergency_contact_phone || ''} 
                    onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} 
                    disabled={loading} 
                    maxLength={10} 
                    className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200" 
                    placeholder="Contact phone" 
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                    {profile.emergency_contact_phone || '—'}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Relationship</p>
              {editing ? (
                <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 focus:ring-2 focus:ring-rose-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {REL_OPTIONS.map(r => (
                      <SelectItem key={r} value={r} className="text-sm">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  {profile.emergency_contact_relation || '—'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Permanent Address */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500 rounded-lg shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Permanent Address</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Address</p>
              {editing ? (
                <Textarea 
                  value={formData.address || ''} 
                  onChange={e => onFieldChange('address', e.target.value)} 
                  disabled={loading} 
                  rows={2} 
                  className={`text-sm border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300 focus:ring-red-200' : ''}`} 
                  placeholder="Complete address" 
                />
              ) : (
                <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  {profile.address || '—'}
                </div>
              )}
              {errors.address && <p className="text-[9px] text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['city', 'state', 'pincode'] as const).map(f => (
                <div key={f}>
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1 capitalize">{f}</p>
                  {editing ? (
                    <Input 
                      value={formData[f] as string || ''} 
                      onChange={e => onFieldChange(f, e.target.value)} 
                      disabled={loading} 
                      className={`h-9 text-sm border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors[f] ? 'border-red-300 focus:ring-red-200' : ''}`} 
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                      {(profile as any)[f] || '—'}
                    </p>
                  )}
                  {errors[f] && <p className="text-[9px] text-red-500 mt-1">{errors[f]}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Mode Indicator */}
        {editing && (
          <div className="bg-[#e6f0ff] border border-[#004aad]/30 rounded-xl p-3 flex items-center gap-2">
            <PenLine className="h-4 w-4 text-[#004aad]" />
            <p className="text-xs text-[#004aad] font-medium">You are editing your profile</p>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW - Enhanced with logo colors ─────────────────────────────────
  return (
    <div className="space-y-5 pb-6">
      
      

      {/* Profile Header Card - Blue and gold theme */}
      <Card className="border-none shadow-lg bg-gradient-to-r from-[#004aad] to-[#002a7a] overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#ffc107]/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-black/20 rounded-full -ml-10 -mb-10"></div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-xl bg-[#ffc107] flex items-center justify-center shadow-lg border border-white/30">
              <User className="h-8 w-8 text-[#004aad]" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {displayEmail}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {displayPhone}
                </span>

              </div>
            </div>
            <Badge className="bg-[#ffc107] text-[#004aad] border-none text-xs px-3 py-1 shadow-md">
              <Hash className="h-3 w-3 inline mr-1" />
              #{displayId}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Basic Information */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
              <SectionHeader icon={User} title="Basic Information" color="blue" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="space-y-1">
                <InfoRow label="Gender" value={displayGender} icon={Heart} />
                <InfoRow label="Date of Birth" value={displayDob} icon={Calendar} badge={age ? `${age}y` : undefined} last />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
              <SectionHeader icon={AlertCircle} title="Emergency Contact" color="rose" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Contact Name</Label>
                    <Input 
                      value={formData.emergency_contact_name || ''} 
                      onChange={e => onFieldChange('emergency_contact_name', e.target.value)} 
                      disabled={loading} 
                      className="border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all" 
                      placeholder="Full name" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone</Label>
                      <Input 
                        value={formData.emergency_contact_phone || ''} 
                        onChange={e => onFieldChange('emergency_contact_phone', e.target.value)} 
                        disabled={loading} 
                        maxLength={10} 
                        className="border-slate-200 focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all" 
                        placeholder="Phone number" 
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Relationship</Label>
                      <Select value={formData.emergency_contact_relation || ''} onValueChange={v => onFieldChange('emergency_contact_relation', v)} disabled={loading}>
                        <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-rose-200">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {REL_OPTIONS.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <InfoRow label="Name" value={profile.emergency_contact_name || '—'} icon={User} />
                  <InfoRow label="Phone" value={profile.emergency_contact_phone || '—'} icon={Phone} />
                  <InfoRow label="Relationship" value={profile.emergency_contact_relation || '—'} icon={Users} last />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Occupation */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-[#fff9e6] to-[#fff2cc] border-b border-[#ffc107]/30">
              <SectionHeader icon={Briefcase} title="Occupation" color="gold" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Category</Label>
                    <Select value={formData.occupation_category || ''} onValueChange={v => onFieldChange('occupation_category', v)} disabled={loading}>
                      <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {OCC_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Occupation</Label>
                    <Input 
                      value={formData.occupation || ''} 
                      onChange={e => onFieldChange('occupation', e.target.value)} 
                      disabled={loading} 
                      className={`border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] ${errors.occupation ? 'border-red-300 focus:ring-red-200' : ''}`} 
                      placeholder="Your profession" 
                    />
                    {errors.occupation && <p className="text-xs text-red-500 mt-1.5">{errors.occupation}</p>}
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Exact Details</Label>
                    <Textarea 
                      value={formData.exact_occupation || ''} 
                      onChange={e => onFieldChange('exact_occupation', e.target.value)} 
                      disabled={loading} 
                      rows={3} 
                      className="border-slate-200 focus:ring-2 focus:ring-[#ffc107] focus:border-[#ffc107] resize-none" 
                      placeholder="Job title, company, responsibilities..." 
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <InfoRow label="Category" value={profile.occupation_category || '—'} icon={Building} />
                  <InfoRow label="Occupation" value={profile.occupation || '—'} icon={Briefcase} />
                  <InfoRow label="Exact Details" value={profile.exact_occupation || '—'} icon={Shield} last />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permanent Address */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2 px-6 pt-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
              <SectionHeader icon={MapPin} title="Permanent Address" color="emerald" />
            </CardHeader>
            <CardContent className="px-6 py-4">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Address</Label>
                    <Textarea 
                      value={formData.address || ''} 
                      onChange={e => onFieldChange('address', e.target.value)} 
                      disabled={loading} 
                      rows={2} 
                      className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.address ? 'border-red-300 focus:ring-red-200' : ''}`} 
                      placeholder="Complete address" 
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1.5">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">City</Label>
                      <Input 
                        value={formData.city || ''} 
                        onChange={e => onFieldChange('city', e.target.value)} 
                        disabled={loading} 
                        className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.city ? 'border-red-300 focus:ring-red-200' : ''}`} 
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1.5">{errors.city}</p>}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">State</Label>
                      <Input 
                        value={formData.state || ''} 
                        onChange={e => onFieldChange('state', e.target.value)} 
                        disabled={loading} 
                        className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.state ? 'border-red-300 focus:ring-red-200' : ''}`} 
                      />
                      {errors.state && <p className="text-xs text-red-500 mt-1.5">{errors.state}</p>}
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Pincode</Label>
                      <Input 
                        value={formData.pincode || ''} 
                        onChange={e => onFieldChange('pincode', e.target.value)} 
                        disabled={loading} 
                        className={`border-slate-200 focus:ring-2 focus:ring-emerald-200 ${errors.pincode ? 'border-red-300 focus:ring-red-200' : ''}`} 
                      />
                      {errors.pincode && <p className="text-xs text-red-500 mt-1.5">{errors.pincode}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <InfoRow label="Address" value={profile.address || '—'} icon={Home} />
                  <InfoRow label="City" value={profile.city || '—'} icon={MapPin} />
                  <InfoRow label="State" value={profile.state || '—'} icon={Building} />
                  <InfoRow label="Pincode" value={profile.pincode || '—'} icon={Mail} last />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {editing && (
        <div className="mt-4 p-3 bg-[#e6f0ff] border border-[#004aad]/30 rounded-lg flex items-center gap-2">
          <PenLine className="h-4 w-4 text-[#004aad]" />
          <p className="text-xs text-[#004aad]">You are in edit mode. Changes will be saved when you click the Save button.</p>
        </div>
      )}
    </div>
  );
}