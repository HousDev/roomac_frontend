

// components/tenant/profile/AccommodationTab.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building, Home, Bed, Users, Briefcase,
  BadgeIndianRupee, User, Phone, MapPin, Calendar,
  Mail, CheckCircle, XCircle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';
import { type StaffMember } from '@/lib/staffApi';

interface AccommodationTabProps {
  profile: TenantProfile;
  isMobile?: boolean;
  propertyManagerStaff?: StaffMember | null;
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

export default function AccommodationTab({
  profile,
  isMobile = false,
  propertyManagerStaff = null,
}: AccommodationTabProps) {

  const hasAccommodation = profile.room_id !== null && profile.room_id !== undefined;
  const hasProperty = profile.property_id !== null && profile.property_id !== undefined;
  const isActive = profile.is_active === 1 || profile.is_active === true || profile.is_active === '1';

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
      const sal = propertyManagerStaff.salutation ? `${propertyManagerStaff.salutation} ` : '';
      return `${sal}${propertyManagerStaff.name}`;
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

  // Debug log
  console.log("🏠 AccommodationTab - Profile data:", {
    tenant_rent: profile.tenant_rent,
    rent_per_bed: profile.rent_per_bed,
    monthly_rent: profile.monthly_rent,
    final_rent: rentAmount,
    bed_type: profile.bed_type,
    is_couple: profile.is_couple,
    sharing_type: profile.sharing_type, // This should now show
    preferred_sharing: profile.preferred_sharing
  });

  // ── No accommodation ───────────────────────────────────────────────────────
  if (!hasAccommodation) {
    return (
      <Card>
        <CardContent className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-slate-100 rounded-full">
              <Home className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-slate-400`} />
            </div>
          </div>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>
            No Room Assignment Yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
            Your accommodation is being processed. Once assigned, your room and bed details will appear here.
          </p>
          {hasProperty && (
            <div className="border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-left">
              <p className="text-xs text-slate-400 mb-1">Registered at</p>
              <p className="text-sm font-medium text-slate-800">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {getManagerPhone() !== '—' && (
                <p className="text-xs text-slate-500 mt-1.5">
                  Manager: {getManagerDisplayName()} · {getManagerPhone()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ── MOBILE VIEW ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Property */}
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Property</p>
          <div className="flex items-start gap-2">
            <Building className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {profile.property_address && (
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{profile.property_address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Room / Bed / Type / Rent — 2×2 grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Room</p>
            <p className="text-xl font-bold text-slate-800">{profile.room_number || `#${profile.room_id}`}</p>
            {profile.floor && <p className="text-[10px] text-slate-400">Floor {profile.floor}</p>}
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Bed</p>
            <p className="text-xl font-bold text-slate-800">{getBedDisplay()}</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Room Type</p>
            <p className="text-sm font-medium text-slate-700">{profile.room_type || 'Standard'}</p>
          </div>
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Rent / Month</p>
            <p className="text-sm font-semibold text-slate-800">
              ₹{rentAmount ? rentAmount.toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Sharing Type - FIXED: Now using sharing_type from rooms table */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">Sharing:</span>
            <Badge variant="outline" className="text-[10px] px-2 py-0">
              {getSharingType()}
            </Badge>
          </div>
          {profile.bed_assigned_at && (
            <span className="text-[10px] text-slate-400">Since {formatDate(profile.bed_assigned_at)}</span>
          )}
        </div>

        {/* Couple Badge */}
        {/* {profile.is_couple && (
          <div className="flex justify-end px-1">
            <Badge className="bg-pink-100 text-pink-700 border-pink-200">
              👫 Couple Booking
            </Badge>
          </div>
        )} */}

        {/* Property Manager — salutation from staff API */}
        {hasManager && (
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Property Manager</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                {getManagerPhoto()
                  ? <img src={getManagerPhoto()!} alt="" className="h-8 w-8 rounded-full object-cover" />
                  : <User className="h-4 w-4 text-slate-400" />
                }
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">{getManagerDisplayName()}</p>
                <p className="text-[10px] text-slate-400">{getManagerRole()}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {getManagerPhone() !== '—' && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-600">{getManagerPhone()}</span>
                </div>
              )}
              {getManagerEmail() !== '—' && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-600 truncate">{getManagerEmail()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {profile.property_address && (
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">Location</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-700">{profile.property_address}</p>
                {(profile.property_city || profile.property_state) && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {[profile.property_city, profile.property_state].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── DESKTOP VIEW ───────────────────────────────────────────────────────────
  return (
    <>
      {/* Status Card */}
      <Card className="mb-4 border-l-4 border-l-green-500">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isActive ? (
                <><CheckCircle className="h-5 w-5 text-green-500" /><span className="font-medium text-green-700">Active Account</span></>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" /><span className="font-medium text-red-700">Inactive Account</span></>
              )}
            </div>
            {profile.check_in_date && (
              <Badge variant="outline" className="bg-blue-50">
                Check-in: {formatDate(profile.check_in_date)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Accommodation Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Accommodation</CardTitle>
          <CardDescription>Your assigned room and bed details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Building className="h-4 w-4" />
                <Label>Property</Label>
              </div>
              <p className="text-lg font-semibold">
                {profile.property_name || `Property #${profile.property_id}`}
              </p>
              {profile.property_address && (
                <p className="text-xs text-gray-500 mt-1">{profile.property_address}</p>
              )}
              {profile.property_city && (
                <p className="text-xs text-gray-400 mt-1">{profile.property_city}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Home className="h-4 w-4" />
                <Label>Room Number</Label>
              </div>
              <p className="text-lg font-semibold">
                {profile.room_number || `Room #${profile.room_id}`}
              </p>
              {profile.floor && (
                <p className="text-xs text-gray-500 mt-1">Floor: {profile.floor}</p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Bed className="h-4 w-4" />
                <Label>Bed</Label>
              </div>
              <p className="text-lg font-semibold">{getBedDisplay()}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase className="h-4 w-4" />
                <Label>Room Type</Label>
              </div>
              <p className="text-lg font-semibold">{profile.room_type || 'Standard'}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <BadgeIndianRupee className="h-4 w-4" />
                <Label>Monthly Rent</Label>
              </div>
              <p className="text-lg font-semibold text-green-600">
                ₹ {rentAmount ? rentAmount.toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <Label>Sharing</Label>
              </div>
              <p className="text-lg font-semibold">{getSharingType()}</p>
            </div>
          </div>

          {/* Couple Badge
          {profile.is_couple && (
            <div className="mt-3 flex">
              <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                👫 Couple Booking
              </Badge>
            </div>
          )} */}

          {profile.bed_assigned_at && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Bed assigned on: {formatDate(profile.bed_assigned_at)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Manager */}
      {hasManager && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Contact information for property management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <Label>Manager Name</Label>
                </div>
                <p className="text-lg font-semibold">{getManagerDisplayName()}</p>
                <p className="text-xs text-gray-400">{getManagerRole()}</p>
              </div>

              {getManagerPhone() !== '—' && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <Label>Manager Phone</Label>
                  </div>
                  <p className="text-lg font-semibold">{getManagerPhone()}</p>
                </div>
              )}

              {getManagerEmail() !== '—' && (
                <div className="space-y-1 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Mail className="h-4 w-4" />
                    <Label>Manager Email</Label>
                  </div>
                  <p className="text-base">{getManagerEmail()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Address */}
      {profile.property_address && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Property Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base">{profile.property_address}</p>
                  {(profile.property_city || profile.property_state) && (
                    <p className="text-xs text-gray-500 mt-1">
                      {[profile.property_city, profile.property_state].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}