// components/tenant/profile/AccountInformation.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Info as IconInfo, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  MapPin,
  Shield,
  Heart,
  Clock,
  AlertCircle,
  XCircle,
  Home
} from "lucide-react";
import type { TenantProfile } from "@/lib/tenantDetailsApi";
import { useEffect } from "react";

interface AccountInformationProps {
  tenant: TenantProfile | null;
}

// Info Card Component for consistent styling
const InfoCard = ({ icon: Icon, label, value, color = "blue" }: { 
  icon: any; 
  label: string; 
  value: string | number;
  color?: "blue" | "gold" | "rose";
}) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-[#e6f0ff] text-[#004aad]';
      case 'gold': return 'bg-[#fff9e6] text-[#ffc107]';
      case 'rose': return 'bg-rose-50 text-rose-600';
      default: return 'bg-[#e6f0ff] text-[#004aad]';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${getColorClasses()}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-sm font-semibold text-slate-800 break-words">{value || '—'}</p>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge className={`${
      isActive 
        ? 'bg-green-50 text-green-600 border-green-200' 
        : 'bg-rose-50 text-rose-600 border-rose-200'
    } border text-xs px-3 py-1`}>
      {isActive ? (
        <>
          <Shield className="h-3 w-3 mr-1" />
          Active Account
        </>
      ) : (
        <>
          <XCircle className="h-3 w-3 mr-1" />
          Inactive Account
        </>
      )}
    </Badge>
  );
};

// Deletion Request Badge
const DeletionRequestBadge = ({ status }: { status?: string }) => {
  if (!status || status === 'none') return null;

  const config = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: Clock, label: 'Deletion Pending' },
    approved: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: Shield, label: 'Deletion Approved' },
    rejected: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: XCircle, label: 'Deletion Rejected' },
    cancelled: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: XCircle, label: 'Deletion Cancelled' }
  };

  const configKey = status as keyof typeof config;
  const { bg, text, border, icon: Icon, label } = config[configKey] || config.pending;

  return (
    <Badge className={`${bg} ${text} ${border} border text-xs px-3 py-1`}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};

export default function AccountInformation({ tenant }: AccountInformationProps) {
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  // Calculate age
  const calculateAge = (dob?: string): number | null => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const age = calculateAge(tenant?.date_of_birth);

  // Get account creation date
  const getAccountCreatedDate = (): string => {
    if (tenant?.created_at) return formatDate(tenant.created_at);
    if (tenant?.check_in_date) return formatDate(tenant.check_in_date);
    return "N/A";
  };

  // If tenant is null, show loading state
  if (!tenant) {
    return (
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center">
            <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
              <div className="h-8 w-8 border-4 border-[#004aad] border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-sm font-medium text-slate-600">Loading account information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDeletionRequest = tenant.deletion_request && tenant.deletion_request.status !== 'none';

  return (
    <div className="space-y-5">
      
      {/* Header with Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
          <p className="text-xs text-slate-400 mt-0.5">Your basic personal details</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge isActive={tenant.is_active} />
          {hasDeletionRequest && (
            <DeletionRequestBadge status={tenant.deletion_request?.status} />
          )}
        </div>
      </div>

      {/* Basic Personal Details - Single Card */}
     <Card className="border border-slate-200 shadow-sm overflow-hidden">
  <CardHeader className="pb-2 px-5 pt-4 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-[#004aad] rounded-lg">
        <User className="h-3.5 w-3.5 text-white" />
      </div>
      <CardTitle className="text-sm font-semibold text-slate-800">Basic Details</CardTitle>
    </div>
  </CardHeader>
  <CardContent className="p-5">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Full Name */}
      <InfoCard 
        icon={User} 
        label="Full Name" 
        value={tenant.full_name || "—"} 
        color="blue"
      />
      
      {/* Email */}
      <InfoCard 
        icon={Mail} 
        label="Email Address" 
        value={tenant.email || "—"} 
        color="gold"
      />
      
      {/* Phone */}
      <InfoCard 
        icon={Phone} 
        label="Phone Number" 
        value={tenant.country_code ? `${tenant.country_code} ${tenant.phone}` : tenant.phone || "—"} 
        color="blue"
      />
      
      {/* Gender */}
      <InfoCard 
        icon={Heart} 
        label="Gender" 
        value={tenant.gender || "—"} 
        color="gold"
      />
      
      {/* Date of Birth */}
      <InfoCard 
        icon={Calendar} 
        label="Date of Birth" 
        value={formatDate(tenant.date_of_birth)} 
        color="blue"
      />
      
      {/* Address - Full width on all screens */}
      {(tenant.address || tenant.city || tenant.state || tenant.pincode) && (
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
          <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#004aad] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-sm text-slate-700">{tenant.address || "—"}</p>
                {(tenant.city || tenant.state || tenant.pincode) && (
                  <p className="text-xs text-[#004aad] mt-1.5 font-medium">
                    {[tenant.city, tenant.state, tenant.pincode].filter(Boolean).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </CardContent>
</Card>
      

      {/* Emergency Contact Section - Only if exists */}
      {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-4 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-500 rounded-lg">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
              <CardTitle className="text-sm font-semibold text-slate-800">Emergency Contact</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tenant.emergency_contact_name && (
                <InfoCard 
                  icon={User} 
                  label="Contact Name" 
                  value={tenant.emergency_contact_name} 
                  color="rose"
                />
              )}
              {tenant.emergency_contact_phone && (
                <InfoCard 
                  icon={Phone} 
                  label="Contact Phone" 
                  value={tenant.emergency_contact_phone} 
                  color="rose"
                />
              )}
            </div>
            {tenant.emergency_contact_relation && (
              <div className="mt-3">
                <Badge className="bg-rose-50 text-rose-600 border-rose-200 text-xs px-3 py-1">
                  {tenant.emergency_contact_relation}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Account Created Date */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#004aad]" />
              <span className="text-xs font-medium text-slate-600">Account Created</span>
            </div>
            <span className="text-sm font-semibold text-slate-800">{getAccountCreatedDate()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert className="bg-[#e6f0ff] border-[#004aad]/20">
        <IconInfo className="h-4 w-4 text-[#004aad]" />
        <AlertDescription className="text-xs text-[#004aad]">
          To update your personal information, visit the <span className="font-semibold">Profile</span> tab and click "Edit Profile".
        </AlertDescription>
      </Alert>
    </div>
  );
}