

// components/tenant/profile/AccommodationTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building, Home, Bed, Users, Briefcase,
  BadgeIndianRupee, User, Phone, MapPin, Calendar,
  Mail, CheckCircle, XCircle, Loader2, Award,
  ChevronRight, Key, DoorOpen, CalendarDays, MapPinned
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';
import { type StaffMember } from '@/lib/staffApi';
import { consumeMasters } from '@/lib/masterApi';
import { useEffect, useState } from 'react';

interface AccommodationTabProps {
  profile: TenantProfile;
  isMobile?: boolean;
  propertyManagerStaff?: StaffMember | null;
}

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

// Helper function to format sharing type
const formatSharingType = (type?: string): string => {
  if (!type) return 'Not specified';
  
  const lower = type.toLowerCase();
  if (lower.includes('single')) return 'Single Occupancy';
  if (lower.includes('double')) return 'Double Sharing';
  if (lower.includes('triple')) return 'Triple Sharing';
  if (lower.includes('other')) return 'Custom Sharing';
  
  // Capitalize first letter
  return type.charAt(0).toUpperCase() + type.slice(1);
};

// Helper function to map state ID to state name
const getStateName = (stateId: string | null | undefined, commonMasters: Record<string, MasterValue[]>): string => {
  if (!stateId) return 'N/A';
  
  const states = commonMasters["States"] || [];
  const state = states.find(s => String(s.id) === String(stateId));
  return state ? state.name : String(stateId);
};

// Info Card Component for consistent styling
const InfoCard = ({ icon: Icon, label, value, subvalue, color = "blue" }: { 
  icon: any; 
  label: string; 
  value: string | number;
  subvalue?: string;
  color?: "blue" | "gold" | "green" | "rose" | "emerald";
}) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'bg-[#e6f0ff] text-[#004aad]';
      case 'gold': return 'bg-[#fff9e6] text-[#ffc107]';
      case 'green': return 'bg-green-50 text-green-600';
      case 'rose': return 'bg-rose-50 text-rose-600';
      case 'emerald': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-[#e6f0ff] text-[#004aad]';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${getColorClasses()}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-base font-bold text-slate-800 truncate">{value}</p>
          {subvalue && <p className="text-xs text-slate-500 mt-1">{subvalue}</p>}
        </div>
      </div>
    </div>
  );
};

// Stat Card for numbers
const StatCard = ({ icon: Icon, label, value, color = "blue" }: {
  icon: any;
  label: string;
  value: string | number;
  color?: "blue" | "gold";
}) => {
  const getColorClasses = () => {
    switch(color) {
      case 'blue': return 'text-[#004aad] bg-[#e6f0ff]';
      case 'gold': return 'text-[#ffc107] bg-[#fff9e6]';
      default: return 'text-[#004aad] bg-[#e6f0ff]';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`p-1.5 rounded-lg ${getColorClasses()}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
};

export default function AccommodationTab({
  profile,
  isMobile = false,
  propertyManagerStaff = null,
}: AccommodationTabProps) {
  // Masters data state
  const [commonMasters, setCommonMasters] = useState<Record<string, MasterValue[]>>({});
  const [commonMastersLoaded, setCommonMastersLoaded] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(false);

  const hasAccommodation = profile.room_id !== null && profile.room_id !== undefined;
  const hasProperty = profile.property_id !== null && profile.property_id !== undefined;
  const isActive = profile.is_active === 1 || profile.is_active === true || profile.is_active === '1';

  // Fetch common masters on component mount
  useEffect(() => {
    const fetchCommonMasters = async () => {
      setLoadingMasters(true);
      try {
        const res = await consumeMasters({ tab: "Common" });
        if (res?.success && res.data) {
          const grouped: Record<string, MasterValue[]> = {};
          res.data.forEach((item: any) => {
            const type = item.type_name;
            if (!grouped[type]) {
              grouped[type] = [];
            }
            grouped[type].push({
              id: item.value_id,
              name: item.value_name,
              isactive: 1,
            });
          });
          console.log("Common Masters loaded in AccommodationTab:", grouped);
          setCommonMasters(grouped);
          setCommonMastersLoaded(true);
        }
      } catch (error) {
        console.error("Failed to fetch common masters:", error);
      } finally {
        setLoadingMasters(false);
      }
    };
    
    fetchCommonMasters();
  }, []);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    try { return format(parseISO(dateString), 'dd MMM yyyy'); }
    catch { return 'Invalid Date'; }
  };

  // ── Get the correct rent amount from tenant_rent (bed_assignments) first ──
  const getRentAmount = (): number => {
    // First priority: tenant_rent from bed_assignments
    if (profile.tenant_rent) {
      return Number(profile.tenant_rent);
    }
    // Second priority: rent_per_bed from rooms table
    if (profile.rent_per_bed) {
      return Number(profile.rent_per_bed);
    }
    // Third priority: monthly_rent from bookings
    if (profile.monthly_rent) {
      return Number(profile.monthly_rent);
    }
    return 0;
  };

  const rentAmount = getRentAmount();

  // ── Get bed display with type ──
  const getBedDisplay = (): string => {
    if (!profile.bed_number) return 'N/A';
    
    let bedDisplay = `#${profile.bed_number}`;
    if (profile.bed_type) {
      bedDisplay += ` (${profile.bed_type})`;
    }
    return bedDisplay;
  };

  // ── Get sharing type from room data ──
  const getSharingType = (): string => {
    // Try to get from profile.sharing_type first (from rooms table)
    if (profile.sharing_type) {
      return formatSharingType(profile.sharing_type);
    }
    // Fallback to preferred_sharing if no room sharing_type
    if (profile.preferred_sharing) {
      return formatSharingType(profile.preferred_sharing);
    }
    return 'Not specified';
  };

  // ── Same helpers as page.tsx ───────────────────────────────────────────────
 const getManagerDisplayName = () => {
  if (propertyManagerStaff) {
    // Capitalize first letter of salutation if it exists
    let salutation = propertyManagerStaff.salutation || '';
    if (salutation) {
      // Capitalize first letter, make rest lowercase
      salutation = salutation.charAt(0).toUpperCase() + salutation.slice(1).toLowerCase();
      salutation = `${salutation} `;
    }
    return `${salutation}${propertyManagerStaff.name}`;
  }
  return profile.property_manager_name || profile.manager_name || '—';
};

  const getManagerRole = () => {
    // First priority: role_name from staff data (this comes from masters)
    if (propertyManagerStaff?.role_name) {
      return propertyManagerStaff.role_name;
    }
    
    // Second priority: role field from staff data
    if (propertyManagerStaff?.role) {
      return propertyManagerStaff.role;
    }
    
    // Third priority: if staff has staff_role_id but no role_name
    if (propertyManagerStaff?.staff_role_id) {
      return `Role ID: ${propertyManagerStaff.staff_role_id}`;
    }
    
    // Default fallback
    return 'Property Manager';
  };
  
  const getManagerPhone = () =>
    propertyManagerStaff?.phone || profile.property_manager_phone || profile.manager_phone || '—';
  const getManagerEmail = () =>
    propertyManagerStaff?.email || (profile as any)?.property_manager_email || '—';
  const getManagerPhoto = () => propertyManagerStaff?.photo_url || null;

  const hasManager = !!(profile.property_manager_name || profile.manager_name || propertyManagerStaff);

  // Get state name from masters
  const getPropertyState = () => {
    if (!profile.property_state) return 'N/A';
    if (commonMastersLoaded) {
      return getStateName(profile.property_state, commonMasters);
    }
    return profile.property_state; // Return ID while loading
  };

  // Debug log
  console.log("🏠 AccommodationTab - Profile data:", {
    tenant_rent: profile.tenant_rent,
    rent_per_bed: profile.rent_per_bed,
    monthly_rent: profile.monthly_rent,
    final_rent: rentAmount,
    bed_type: profile.bed_type,
    is_couple: profile.is_couple,
    sharing_type: profile.sharing_type,
    preferred_sharing: profile.preferred_sharing,
    property_state: profile.property_state,
    mapped_state: getPropertyState()
  });

  // ── No accommodation ───────────────────────────────────────────────────────
  if (!hasAccommodation) {
    return (
      <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#004aad]/5 rounded-full -mr-20 -mt-20"></div>
        <CardContent className={`text-center relative z-10 ${isMobile ? 'py-8' : 'py-12'}`}>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-[#004aad] to-[#002a7a] rounded-2xl shadow-lg">
              <Home className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-white`} />
            </div>
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-slate-800 mb-2`}>
            No Room Assignment Yet
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">
            Your accommodation is being processed. Once assigned, your room and bed details will appear here.
          </p>
          {hasProperty && (
            <div className="border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-[#004aad]" />
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered at</p>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {getManagerPhone() !== '—' && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <User className="h-3 w-3 text-[#ffc107]" />
                  <span>{getManagerDisplayName()} · {getManagerPhone()}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── Loading state while masters are loading ──
  if (loadingMasters && !commonMastersLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="p-4 bg-[#e6f0ff] rounded-2xl mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#004aad]" />
        </div>
        <span className="text-sm font-medium text-slate-600">Loading location details...</span>
      </div>
    );
  }

  // ── MOBILE VIEW - Enhanced with logo colors ───────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3 pb-4">
        
        {/* Status Badge */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-green-50' : 'bg-red-50'}`}>
              {isActive ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
              {isActive ? 'Active Account' : 'Inactive Account'}
            </span>
          </div>
          {profile.check_in_date && (
            <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-[10px] px-2 py-0.5">
              <Calendar className="h-3 w-3 inline mr-1" />
              Check-in: {formatDate(profile.check_in_date)}
            </Badge>
          )}
        </div>

        {/* Property Header Card */}
        <div className="bg-gradient-to-r from-[#004aad] to-[#002a7a] rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffc107] rounded-xl">
              <Building className="h-5 w-5 text-[#004aad]" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Property</p>
              <p className="text-base font-bold text-white">{profile.property_name || `Property #${profile.property_id}`}</p>
              {profile.property_address && (
                <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{profile.property_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Room Details Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#e6f0ff] rounded-lg">
                <DoorOpen className="h-3.5 w-3.5 text-[#004aad]" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase">Room</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{profile.room_number || `#${profile.room_id}`}</p>
            {profile.floor && <p className="text-[10px] text-slate-400 mt-0.5">Floor {profile.floor}</p>}
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#fff9e6] rounded-lg">
                <Bed className="h-3.5 w-3.5 text-[#ffc107]" />
              </div>
              <span className="text-[10px] font-medium text-slate-400 uppercase">Bed</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{getBedDisplay()}</p>
          </div>
        </div>

        {/* Additional Info Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Room Type</p>
            <p className="text-sm font-bold text-slate-800">{profile.room_type || 'Standard'}</p>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider mb-1">Monthly Rent</p>
            <p className="text-sm font-bold text-[#004aad]">
              ₹{rentAmount ? rentAmount.toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Sharing Type with Badge */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#004aad]" />
              <span className="text-xs font-medium text-slate-600">Sharing Type</span>
            </div>
            <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-xs px-3 py-1">
              {getSharingType()}
            </Badge>
          </div>
          {profile.bed_assigned_at && (
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
              <CalendarDays className="h-3 w-3" />
              <span>Since {formatDate(profile.bed_assigned_at)}</span>
            </div>
          )}
        </div>

        {/* Property Manager */}
        {hasManager && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500 rounded-lg">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Property Manager</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center overflow-hidden border-2 border-rose-200">
                  {getManagerPhoto()
                    ? <img src={getManagerPhoto()!} alt="" className="h-10 w-10 rounded-full object-cover" />
                    : <User className="h-5 w-5 text-rose-500" />
                  }
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{getManagerDisplayName()}</p>
                  <p className="text-[10px] text-rose-500 font-medium">{getManagerRole()}</p>
                </div>
              </div>
              <div className="space-y-2">
                {getManagerPhone() !== '—' && (
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600">{getManagerPhone()}</span>
                  </div>
                )}
                {getManagerEmail() !== '—' && (
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 truncate">{getManagerEmail()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location */}
        {profile.property_address && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500 rounded-lg">
                  <MapPinned className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Location</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">{profile.property_address}</p>
                  {(profile.property_city || profile.property_state) && (
                    <p className="text-xs font-medium text-[#004aad] mt-1.5">
                      {[
                        profile.property_city, 
                        getPropertyState()
                      ].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW - Enhanced with logo colors ───────────────────────────────
  return (
    <div className="space-y-5 pb-6">
      
      {/* Header */}
     

      {/* Status Card */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-slate-50 to-white overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isActive ? 'bg-green-50' : 'bg-red-50'}`}>
                {isActive ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isActive ? 'Active Account' : 'Inactive Account'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Your account status</p>
              </div>
            </div>
            {profile.check_in_date && (
              <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-sm px-3 py-1.5">
                <Calendar className="h-4 w-4 mr-1.5" />
                Check-in: {formatDate(profile.check_in_date)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Building} 
          label="Property" 
          value={profile.property_name || `Property #${profile.property_id}`}
          color="blue"
        />
        <StatCard 
          icon={DoorOpen} 
          label="Room" 
          value={profile.room_number || `#${profile.room_id}`}
          color="gold"
        />
        <StatCard 
          icon={Bed} 
          label="Bed" 
          value={getBedDisplay()}
          color="blue"
        />
        <StatCard 
          icon={BadgeIndianRupee} 
          label="Monthly Rent" 
          value={`₹${rentAmount ? rentAmount.toLocaleString('en-IN') : 'N/A'}`}
          color="gold"
        />
      </div>

      {/* Main Accommodation Card */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 px-6 pt-5 bg-gradient-to-r from-[#e6f0ff] to-[#f0f5ff] border-b border-[#004aad]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#004aad] rounded-lg">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">Room Details</CardTitle>
              <CardDescription className="text-xs">Your assigned accommodation information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InfoCard 
              icon={Building}
              label="Property Name"
              value={profile.property_name || `Property #${profile.property_id}`}
              subvalue={profile.property_address}
              color="blue"
            />

            <InfoCard 
              icon={DoorOpen}
              label="Room Number"
              value={profile.room_number || `#${profile.room_id}`}
              subvalue={profile.floor ? `Floor ${profile.floor}` : undefined}
              color="gold"
            />

            <InfoCard 
              icon={Bed}
              label="Bed Details"
              value={getBedDisplay()}
              color="blue"
            />

            <InfoCard 
              icon={Briefcase}
              label="Room Type"
              value={profile.room_type || 'Standard'}
              color="gold"
            />

            <InfoCard 
              icon={BadgeIndianRupee}
              label="Monthly Rent"
              value={`₹${rentAmount ? rentAmount.toLocaleString('en-IN') : 'N/A'}`}
              color="blue"
            />

            <InfoCard 
              icon={Users}
              label="Sharing Type"
              value={getSharingType()}
              subvalue={profile.bed_assigned_at ? `Since ${formatDate(profile.bed_assigned_at)}` : undefined}
              color="gold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Manager */}
      {hasManager && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 px-6 pt-5 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500 rounded-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Property Management</CardTitle>
                <CardDescription className="text-xs">Contact information for property management</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center overflow-hidden border-2 border-rose-200">
                {getManagerPhoto()
                  ? <img src={getManagerPhoto()!} alt="" className="h-16 w-16 rounded-full object-cover" />
                  : <User className="h-8 w-8 text-rose-500" />
                }
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800">{getManagerDisplayName()}</h3>
                <p className="text-sm text-rose-500 font-medium mt-0.5">{getManagerRole()}</p>
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {getManagerPhone() !== '—' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-1.5 bg-rose-50 rounded-lg">
                        <Phone className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="font-medium text-slate-700">{getManagerPhone()}</p>
                      </div>
                    </div>
                  )}
                  
                  {getManagerEmail() !== '—' && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-1.5 bg-rose-50 rounded-lg">
                        <Mail className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Email</p>
                        <p className="font-medium text-slate-700 truncate">{getManagerEmail()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Location */}
      {profile.property_address && (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 px-6 pt-5 bg-gradient-to-r from-emerald-50 to-green-50 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <MapPinned className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-slate-800">Property Location</CardTitle>
                <CardDescription className="text-xs">Full address details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <MapPin className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-base text-slate-700">{profile.property_address}</p>
                {(profile.property_city || profile.property_state) && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-[#e6f0ff] text-[#004aad] border-none text-xs px-3 py-1">
                      {profile.property_city}
                    </Badge>
                    {profile.property_state && (
                      <Badge className="bg-[#fff9e6] text-[#ffc107] border-none text-xs px-3 py-1">
                        {getPropertyState()}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}