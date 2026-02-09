// components/admin/tenants/tenant-view-dialog.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Edit, FileText, CheckCircle, MapPin, Building, Bed, IndianRupee } from "lucide-react";
import type { Tenant } from "@/lib/tenantApi";

interface TenantViewDialogProps {
  tenant: Tenant;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function TenantViewDialog({ tenant, isOpen, onOpenChange, onEdit }: TenantViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tenant Details: {tenant.full_name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            {tenant.photo_url && (
              <img 
                src={tenant.photo_url} 
                alt={tenant.full_name}
                className="h-24 w-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{tenant.full_name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={tenant.is_active ? "default" : "secondary"}>
                      {tenant.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">
                      {tenant.gender}
                    </Badge>
                    {tenant.portal_access_enabled && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Portal Access Enabled
                      </Badge>
                    )}
                    {tenant.has_credentials ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Login Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700">
                        No Login
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={onEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-sm">{tenant.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Phone</p>
                  <p className="text-sm">{tenant.country_code} {tenant.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Address</p>
                  <p className="text-sm">{tenant.address}</p>
                  <p className="text-sm">
                    {tenant.city}, {tenant.state} - {tenant.pincode}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Occupation & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Occupation & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-600">Occupation Category</p>
                  <Badge variant="outline">{tenant.occupation_category || "Other"}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Occupation Details</p>
                  <p className="text-sm">{tenant.exact_occupation || tenant.occupation || "-"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Room Preferences</p>
                  <div className="flex gap-2 mt-1">
                    {tenant.preferred_sharing && (
                      <Badge variant="outline">{tenant.preferred_sharing} sharing</Badge>
                    )}
                    {tenant.preferred_room_type && (
                      <Badge variant="outline">{tenant.preferred_room_type}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}