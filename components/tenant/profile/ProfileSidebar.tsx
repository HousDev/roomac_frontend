import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Home, Bed, Calendar, User, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { TenantProfile } from '@/lib/tenantDetailsApi';
import { Edit } from 'lucide-react';

interface ProfileSidebarProps {
  profile: TenantProfile;
  age: number | null;
  editing: boolean;
  onEdit: () => void;
}

export default function ProfileSidebar({ profile, age, editing, onEdit }: ProfileSidebarProps) {
  return (
    <Card className="sticky top-6">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <Avatar className="h-28 w-28 md:h-32 md:w-32 mx-auto mb-4">
            <AvatarImage src={profile.photo_url || ""} alt={profile.full_name} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-100 to-purple-100">
              {profile.full_name
                ? profile.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                : "U"}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl md:text-2xl font-bold mb-2">{profile.full_name}</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant={profile.is_active ? "default" : "secondary"}>
              {profile.is_active ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              {profile.occupation_category || "Tenant"}
            </Badge>
            {profile.portal_access_enabled && (
              <Badge variant="outline" className="bg-green-50">
                Portal Access
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600 truncate">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">{profile.country_code} {profile.phone}</span>
          </div>
          {profile.room_number && (
            <div className="flex items-center gap-3 text-sm">
              <Home className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Room {profile.room_number}</span>
            </div>
          )}
          {profile.bed_number && (
            <div className="flex items-center gap-3 text-sm ml-7">
              <Bed className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Bed {profile.bed_number}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-600">
              Joined {profile.created_at ? format(parseISO(profile.created_at), "dd MMM yyyy") : "N/A"}
            </span>
          </div>
          {profile.date_of_birth && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">
                {age} years • {profile.gender}
              </span>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        {profile.emergency_contact_name && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-sm">Emergency Contact</h4>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{profile.emergency_contact_name}</p>
              <p className="text-gray-600">{profile.emergency_contact_phone}</p>
              <Badge variant="outline" className="text-xs">
                {profile.emergency_contact_relation}
              </Badge>
            </div>
          </div>
        )}

        {!editing && (
          <Button className="w-full mt-6" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </CardContent>
    </Card>
  );
}