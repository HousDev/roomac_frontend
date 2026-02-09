import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Building, Home, Bed, Users, Briefcase, 
  BadgeIndianRupee, User, Phone, MapPin 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';

interface AccommodationTabProps {
  profile: TenantProfile;
}

export default function AccommodationTab({ profile }: AccommodationTabProps) {
  if (!profile.room_id || !profile.room_number || !profile.bed_number) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Home className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Accommodation Assigned</h3>
          <p className="text-gray-500 mb-4">You haven't been assigned a room yet</p>
          <Badge variant="outline" className="bg-yellow-50">
            Pending Assignment
          </Badge>
          {profile.preferred_property_id && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Preferred Property: ID #{profile.preferred_property_id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Current Accommodation</CardTitle>
          <CardDescription>Your assigned room and bed details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Property Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Building className="h-4 w-4" />
                <Label>Property</Label>
              </div>
              <p className="text-lg font-semibold">{profile.property_name || "N/A"}</p>
            </div>

            {/* Room Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Home className="h-4 w-4" />
                <Label>Room Number</Label>
              </div>
              <p className="text-lg font-semibold">{profile.room_number}</p>
            </div>

            {/* Bed Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Bed className="h-4 w-4" />
                <Label>Bed Number</Label>
              </div>
              <p className="text-lg font-semibold">{profile.bed_number}</p>
            </div>

            {/* Floor */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <Label>Floor</Label>
              </div>
              <p className="text-lg font-semibold">{profile.floor || "N/A"}</p>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Briefcase className="h-4 w-4" />
                <Label>Room Type</Label>
              </div>
              <p className="text-lg font-semibold">{profile.room_type || "N/A"}</p>
            </div>

            {/* Monthly Rent */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-500">
                <BadgeIndianRupee className="h-4 w-4" />
                <Label>Monthly Rent</Label>
              </div>
              <p className="text-lg font-semibold text-green-600">
                ₹ {profile.rent_per_bed ? Number(profile.rent_per_bed).toLocaleString("en-IN") : "N/A"}
              </p>
            </div>
          </div>

          {/* Bed Assignment Date */}
          {profile.bed_assigned_at && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-500">
                Bed assigned on: {format(parseISO(profile.bed_assigned_at), "dd MMM yyyy 'at' hh:mm a")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Manager Information */}
      {(profile.property_manager_name || profile.property_manager_phone) && (
        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>Contact information for property management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.property_manager_name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="h-4 w-4" />
                    <Label>Manager Name</Label>
                  </div>
                  <p className="text-lg font-semibold">{profile.property_manager_name}</p>
                </div>
              )}

              {profile.property_manager_phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="h-4 w-4" />
                    <Label>Manager Phone</Label>
                  </div>
                  <p className="text-lg font-semibold">{profile.property_manager_phone}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Address */}
      {profile.property_address && (
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <Label className="text-gray-500">Property Address</Label>
                  <p className="mt-1">{profile.property_address}</p>
                  {profile.property_city && profile.property_state && (
                    <p className="text-sm text-gray-500 mt-1">
                      {profile.property_city}, {profile.property_state}
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