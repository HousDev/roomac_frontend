// components/admin/tenants/columns-config.ts
"use client";

import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building, Bed, CheckCircle, Key, XCircle, MapPin } from "lucide-react";
import type { Column } from "@/components/admin/data-table";
import type { Tenant } from "@/lib/tenantApi";

export const columnsConfig = (
  setSelectedTenant: (tenant: Tenant) => void,
  setIsViewDialogOpen: (open: boolean) => void
): Column<Tenant>[] => [
  {
    key: "full_name",
    label: "Name",
    sortable: true,
    render: (tenant) => (
      <div>
        <p className="font-medium">{tenant.full_name}</p>
        <p className="text-sm text-slate-500">{tenant.gender}</p>
        {tenant.photo_url && (
          <img 
            src={tenant.photo_url} 
            alt={tenant.full_name}
            className="h-10 w-10 object-cover rounded-full mt-1"
          />
        )}
      </div>
    ),
  },
  {
    key: "email",
    label: "Contact",
    render: (tenant) => (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-3 w-3 text-slate-400" />
          {tenant.email}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-3 w-3 text-slate-400" />
          {tenant.country_code} {tenant.phone}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {tenant.city}, {tenant.state}
        </div>
      </div>
    ),
  },
  {
    key: "occupation",
    label: "Occupation",
    sortable: true,
    render: (tenant) => (
      <div>
        <Badge variant="outline" className="mb-1">
          {tenant.occupation_category || "Other"}
        </Badge>
        <p className="text-sm">{tenant.exact_occupation || tenant.occupation}</p>
      </div>
    ),
  },
  {
    key: "property",
    label: "Property & Room",
    render: (tenant) => {
      // Check if tenant has active bed assignment
      if (tenant.current_assignment || tenant.assigned_room_id) {
        const assignment = tenant.current_assignment || {
          property_name: tenant.assigned_property_name,
          room_number: tenant.assigned_room_number,
          bed_number: tenant.assigned_bed_number
        };
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span className="font-medium">
                {assignment.property_name || 'Unknown Property'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Bed className="h-3 w-3" />
              Room {assignment.room_number || 'N/A'} • 
              Bed {assignment.bed_number || 'N/A'}
            </div>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Bed Assigned
            </Badge>
          </div>
        );
      }
      
      // Fallback to booking info if no assignment but has booking
      const activeBooking = tenant.bookings?.find((b) => b.status === "active");
      if (activeBooking) {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              <span className="font-medium">{activeBooking.properties?.name}</span>
            </div>
            {activeBooking.room && (
              <div className="flex items-center gap-1 text-sm">
                <Bed className="h-3 w-3" />
                Room {activeBooking.room.room_number} • 
                {activeBooking.room.sharing_type} sharing • 
                Floor {activeBooking.room.floor}
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Booked
            </Badge>
          </div>
        );
      }
      
      // No assignment or booking
      return tenant.preferred_property_id ? (
        <div className="text-sm text-amber-600">
          <MapPin className="h-3 w-3 inline mr-1" />
          Preference set • {tenant.preferred_sharing} sharing
        </div>
      ) : (
        <span className="text-sm text-slate-400">No assignment</span>
      );
    },
  },
  {
    key: "payments",
    label: "Payments",
    render: (tenant) => {
      const payments = tenant.payments || [];
      const paid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0);
      const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0);
      
      return (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-green-600">₹{paid.toLocaleString()} paid</span>
          </div>
          {pending > 0 && (
            <div className="text-sm">
              <span className="text-red-600">₹{pending.toLocaleString()} pending</span>
            </div>
          )}
          <div className="text-xs text-slate-500">
            {payments.length} transaction(s)
          </div>
        </div>
      );
    },
  },
  {
    key: "is_active",
    label: "Status",
    sortable: true,
    filterable: true,
    render: (tenant) => (
      <div className="space-y-1">
        <div>
          <Badge variant={tenant.is_active ? "default" : "secondary"}>
            {tenant.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {tenant.portal_access_enabled && (
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Portal Access
            </Badge>
          )}
          {tenant.has_credentials ? (
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <Key className="h-3 w-3 mr-1" />
              Login Enabled
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              <XCircle className="h-3 w-3 mr-1" />
              No Login
            </Badge>
          )}
        </div>
      </div>
    ),
  },

  
];