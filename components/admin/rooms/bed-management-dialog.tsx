// components/admin/rooms/BedManagementDialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Bed,
  MapPin,
  UserPlus,
  UserMinus,
  BadgeIndianRupee,
  ClipboardList,
  AlertCircle,
  Check,
  X,
  UserRound,
  Eye,
  Filter,
  Save,
  UsersRound,
  Mail,
  Phone,
  Search,
  ChevronDown,
  RefreshCw,
  Heart,
  Loader2,
  Shield,
  Trash2,
  Pencil, 
  Clock
} from "lucide-react";
import {
  getAvailableBeds,
  assignBed,
  updateBedAssignment,
  getRoomById,
} from "@/lib/roomsApi";
import { request } from "@/lib/api";
import type {
  RoomResponse,
  BedAssignment,
  UpdateBedAssignmentPayload,
  AssignBedPayload,
} from "@/lib/roomsApi";
import { VacateBedWizard } from "@/components/admin/rooms/VacateBedWizard";
import { ChangeBedWizard } from "@/components/admin/rooms/ChangeBedWizard";
import { getAdminVacateRequests } from "@/lib/tenantRequestsApi";
import { EditBedModal } from "@/components/admin/rooms/EditBedModal";
import Swal from "sweetalert2";
import MySwal from "@/app/utils/swal";
import React from "react";
import { getActiveNoticePeriods } from "@/lib/noticePeriodApi";

interface BedManagementDialogProps {
  room: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
  onRoomUpdate?: (room: RoomResponse) => void;
}

interface Tenant {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  is_active: boolean;
  portal_access_enabled: boolean;
  couple_id?: number;
  is_assigned?: boolean;
  is_partner_of_assigned?: boolean;
  check_in_date?: string;
  property_id?: number;
  property_name?: string;
  partner_full_name?: string;
  partner_phone?: string;
  partner_email?: string;
  partner_gender?: string;
  partner_date_of_birth?: string;
  partner_address?: string;
  partner_occupation?: string;
  partner_organization?: string;
  partner_relationship?: string;
  partner_id_proof_type?: string;
  partner_id_proof_number?: string;
  partner_id_proof_url?: string;
  partner_address_proof_type?: string;
  partner_address_proof_number?: string;
  partner_address_proof_url?: string;
  partner_photo_url?: string;
  is_couple_booking?: boolean;
  is_primary_tenant?: boolean;
  partner_tenant_id?: number;
  is_vacated?: boolean;
  partner_is_active?: boolean;
  partner_has_vacated?: boolean;
  partner_of_assigned_bed_number?: number | null;   // ✅ NEW
}

interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const GenderIcon = ({
  gender,
  size = "h-4 w-4",
}: {
  gender: string;
  size?: string;
}) => {
  switch (gender.toLowerCase()) {
    case "male":
    case "male_only":
      return <UserRound className={`${size} text-blue-600`} />;
    case "female":
    case "female_only":
      return <UserRound className={`${size} text-pink-600`} />;
    case "couples":
    case "couple":
      return <UsersRound className={`${size} text-red-600`} />;
    default:
      return <UserRound className={`${size} text-gray-600`} />;
  }
};

// ============================================
// HELPER FUNCTION: Check if tenant is single from couple
// ============================================
const isSingleFromCouple = (tenant: Tenant, allTenants: Tenant[]): boolean => {
  // Check if tenant has couple_id
  if (!tenant.couple_id) return false;
  
  // Check if tenant is active
  if (!tenant.is_active) return false;
  
  // Find partner (same couple_id, different tenant)
  const partner = allTenants.find(
    t => t.couple_id === tenant.couple_id && t.id !== tenant.id
  );
  
  // If no partner found or partner is inactive/vacated
  if (!partner) return true;
  if (partner.is_vacated) return true;
  if (!partner.is_active) return true;
  
  return false;
};

// ============================================
// VALIDATION FUNCTION
// ============================================
const validateTenantForAssignment = (
  tenant: Tenant,
  room: RoomResponse,
  isCoupleBooking: boolean,
  allTenants: Tenant[],
): { valid: boolean; message: string } => {
  // 1. Check if tenant has check-in date
  if (!tenant.check_in_date) {
    return {
      valid: false,
      message: `Tenant "${tenant.full_name}" does not have a check-in date.`,
    };
  }

  // 2. Check if tenant has a property assigned
  if (!tenant.property_id) {
    return {
      valid: false,
      message: `Tenant "${tenant.full_name}" is not assigned to any property.`,
    };
  }

  // 3. Check if room belongs to tenant's property
  if (tenant.property_id !== room.property_id) {
    return {
      valid: false,
      message: `Tenant is assigned to different property, but this room belongs to ${room.property_name}.`,
    };
  }

  // 4. For couple bookings, validate partner details exist
  if (isCoupleBooking) {
    if (!tenant.partner_full_name || !tenant.partner_phone) {
      return {
        valid: false,
        message: `Couple booking requires partner details for "${tenant.full_name}". Please add partner's full name and phone number in tenant profile.`,
      };
    }

    if (!tenant.partner_gender) {
      return {
        valid: false,
        message: `Couple booking requires partner's gender for "${tenant.full_name}". Please update partner details in tenant profile.`,
      };
    }
  }

  return { valid: true, message: "" };
};

// ============================================
// TENANT SELECT DROPDOWN COMPONENT
// ============================================
function TenantSelectDropdown({
  bedNumber,
  value,
  onValueChange,
  tenants,
  loading,
  roomGenderPreferences,
  currentRoomAssignments,
  onSecurityDepositChange,
  customSecurityDeposit,
  onCustomRentChange,
  onIsCoupleChange,
  customRent,
  isCouple,
  room,
  bedRent,
  defaultSecurityDeposit,
}: {
  bedNumber: number;
  value: string;
  onValueChange: (value: string) => void;
  tenants: Tenant[];
  loading: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
  onCustomRentChange?: (rent: string) => void;
  onIsCoupleChange?: (isCouple: boolean) => void;
  onSecurityDepositChange?: (deposit: string) => void;
  customSecurityDeposit?: string;
  customRent?: string;
  isCouple?: boolean;
  room: RoomResponse;
  bedRent?: number;
  defaultSecurityDeposit?: number;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [vacatedTenants, setVacatedTenants] = useState<Set<number>>(new Set());

  // Filter only unassigned tenants AND NOT partners of already assigned tenants
  // Filter only unassigned tenants AND NOT partners of already assigned
  // tenants — UNLESS the partner is linked to THIS SAME bed (i.e. they're
  // the other half of the couple already occupying this exact bed), in
  // which case they must remain selectable so the bed's own dropdown can
  // still assign/re-assign them and pick up their partner details.
  const unassignedTenants = tenants.filter(
    (tenant) =>
      !tenant.is_assigned &&
      !(
        tenant.is_partner_of_assigned &&
        tenant.partner_of_assigned_bed_number !== bedNumber
      ),
  );

  // Filter based on room preferences
  const filteredTenants = unassignedTenants.filter((tenant) => {
    const tenantGender = tenant.gender?.toLowerCase();
    const tenantIsCouple = tenant.couple_id != null && tenant.is_couple_booking === true;

    const hasBothGenders = roomGenderPreferences.some(
      (p) =>
        p.toLowerCase() === "both" ||
        p.toLowerCase() === "any" ||
        p.toLowerCase() === "mixed",
    );

    const hasMaleOnly = roomGenderPreferences.some(
      (p) => p.toLowerCase() === "male_only" || p.toLowerCase() === "male",
    );

    const hasFemaleOnly = roomGenderPreferences.some(
      (p) => p.toLowerCase() === "female_only" || p.toLowerCase() === "female",
    );

    const hasCouplesAllowed = roomGenderPreferences.some(
      (p) => p.toLowerCase() === "couples",
    );

    // If it's a couples room and tenant has a partner, show them
    if (hasCouplesAllowed && tenant.couple_id) {
      return true;
    }

    const assignedGenders = currentRoomAssignments
      .filter(
        (assignment) =>
          assignment.bed_number !== bedNumber && assignment.tenant_gender,
      )
      .map((assignment) => assignment.tenant_gender?.toLowerCase());

    // For rooms with both male and female (mixed gender rooms)
    if (hasBothGenders) {
      return !tenantIsCouple;
    }

    // For male-only rooms
    if (hasMaleOnly && !hasFemaleOnly) {
      // Keep existing logic for regular males
      if (tenantGender === "male" && !tenantIsCouple) {
        return true;
      }
      
      // NEW: Check for single from couple (male)
      if (tenantGender === "male" && isSingleFromCouple(tenant, unassignedTenants)) {
        return true;
      }
      
      return false;
    }

    // For female-only rooms
    if (hasFemaleOnly && !hasMaleOnly) {
      // Keep existing logic for regular females
      if (tenantGender === "female" && !tenantIsCouple) {
        return true;
      }
      
      // NEW: Check for single from couple (female)
      if (tenantGender === "female" && isSingleFromCouple(tenant, unassignedTenants)) {
        return true;
      }
      
      return false;
    }

    // For rooms that allow both male and female (but not "both" preference)
    if (hasMaleOnly && hasFemaleOnly) {
      if (assignedGenders.length > 0) {
        const assignedGender = assignedGenders[0];
        if (assignedGender === "male") {
          return tenantGender === "male" && !tenantIsCouple;
        } else if (assignedGender === "female") {
          return tenantGender === "female" && !tenantIsCouple;
        }
      }
      return (
        (tenantGender === "male" || tenantGender === "female") &&
        !tenantIsCouple
      );
    }

    // For couples rooms
    if (hasCouplesAllowed) {
      return true;
    }

    return true;
  });

  // Get selected tenant
  const selectedTenant = tenants.find((t) => t.id.toString() === value);
  // const isSelectedTenantCouple = selectedTenant?.couple_id != null && selectedTenant?.is_couple_booking === true;

  // Apply search filter
  const searchedTenants = React.useMemo(() => {
    if (searchQuery) {
      return filteredTenants.filter(
        (tenant) =>
          tenant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tenant.phone?.includes(searchQuery) ||
          tenant.id?.toString().includes(searchQuery),
      );
    }
    return filteredTenants;
  }, [searchQuery, filteredTenants]);

  // Sort tenants
  const sortedTenants = React.useMemo(() => {
    return [...searchedTenants].sort((a, b) => {
      if (a.couple_id && !b.couple_id) return -1;
      if (!a.couple_id && b.couple_id) return 1;
      return a.full_name?.localeCompare(b.full_name || "") || 0;
    });
  }, [searchedTenants]);

  const displayRent = bedRent || room.rent_per_bed;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs md:text-sm font-medium">Select Tenant</Label>
        <span className="text-[10px] md:text-xs text-gray-500">
          {sortedTenants.length} available
        </span>
      </div>

      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={loading}
        open={isOpen}
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger className="h-8 md:h-10">
          <SelectValue
            placeholder={
              loading
                ? "Loading..."
                : sortedTenants.length > 0
                  ? "Choose a tenant"
                  : "No tenants available"
            }
          >
            {value &&
              (() => {
                const selected = tenants.find((t) => t.id.toString() === value);
                if (selected) {
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {selected.full_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        (ID: {selected.id})
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[350px] p-0">
          <div className="sticky top-0 z-10 bg-white border-b p-2 md:p-3">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-500" />
              <Input
                placeholder="Search by name, phone, email or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 md:pl-9 h-7 md:h-9 text-xs md:text-sm"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                ref={(input) => {
                  if (input && isOpen) {
                    setTimeout(() => input.focus(), 0);
                  }
                }}
              />
            </div>
            <div className="mt-1 text-[10px] text-gray-500 flex justify-between">
              <span>Total: {sortedTenants.length} tenants</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Active only
              </span>
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto">
            {loading ? (
              <div className="p-4 md:p-6 text-center">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  Loading tenants...
                </p>
              </div>
            ) : sortedTenants.length === 0 ? (
              <div className="p-4 md:p-6 text-center">
                <UserRound className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  No tenants found
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {searchQuery
                    ? "Try a different search"
                    : "All tenants are assigned"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {sortedTenants.map((tenant) => (
                  <SelectItem
                    key={tenant.id}
                    value={tenant.id.toString()}
                    className="py-2 md:py-3"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative">
                          {tenant.couple_id ? (
                            <UsersRound className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                          ) : (
                            <GenderIcon
                              gender={tenant.gender || "Other"}
                              size="h-4 w-4 md:h-5 md:w-5"
                            />
                          )}
                          {tenant.is_active && !tenant.is_vacated && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white"></div>
                          )}
                          {tenant.is_vacated && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs md:text-sm truncate flex items-center gap-2 flex-wrap">
                            {tenant.full_name}
                            {tenant.couple_id && !isSingleFromCouple(tenant, tenants) &&(
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-pink-50 text-pink-700 border-pink-200 ml-1"
                              >
                                Couple
                              </Badge>
                            )}
                            {isSingleFromCouple(tenant, tenants) && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-blue-50 text-blue-700 border-blue-200 ml-1"
                              >
                                Single from Couple
                              </Badge>
                            )}
                            {tenant.is_vacated && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-gray-100 text-gray-600 border-gray-300"
                              >
                                Vacated
                              </Badge>
                            )}
                            {tenant.is_active && !tenant.is_vacated && !tenant.couple_id && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                Active
                              </Badge>
                            )}
                            {!tenant.is_active && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-500 flex flex-wrap items-center gap-1 md:gap-2 mt-0.5">
                            <span>ID: {tenant.id}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {tenant.gender || "Not specified"}
                            </span>
                            {tenant.phone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-2.5 w-2.5" />
                                  {tenant.phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>

      {/* Couple Checkbox - Only show when room allows couples AND tenant is a couple */}
      {/* {roomGenderPreferences.some((pref) => pref.toLowerCase() === "couples") &&
        selectedTenant && (
          <div className="flex items-center space-x-2 mt-3">
            <input
              type="checkbox"
              id={`is-couple-${bedNumber}`}
              checked={isCouple || false}
              onChange={(e) => {
                const newValue = e.target.checked;
                const currentRent = parseFloat(
                  customRent || displayRent.toString(),
                );
                onCustomRentChange?.(String(currentRent));
                if (onIsCoupleChange) {
                  onIsCoupleChange(newValue);
                }
              }}
              className={`h-3 w-3 md:h-4 md:w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500 ${
                isSelectedTenantCouple ? "opacity-100 cursor-not-allowed" : ""
              }`}
            />
            <Label
              htmlFor={`is-couple-${bedNumber}`}
              className={`text-xs md:text-sm font-medium ${
                isSelectedTenantCouple ? "text-gray-700" : "text-gray-700"
              }`}
            >
              Mark as Couple Booking
            </Label>
          </div>
        )} */}

      {/* Custom Rent Input */}
      {selectedTenant && (
        <div className="space-y-3 mt-3">
          <div>
            <Label
              htmlFor={`custom-rent-${bedNumber}`}
              className="text-xs md:text-sm font-medium"
            >
              Bed Rent
            </Label>
            <div className="relative mt-1">
              <BadgeIndianRupee className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-500" />
              <Input
                id={`custom-rent-${bedNumber}`}
                type="text"
                placeholder={`Enter rent amount`}
                value={customRent}
                onChange={(e) => {
                  if (
                    !/^\d*\.?\d*$/.test(e.target.value) ||
                    Number(e.target.value) < 0
                  )
                    return;
                  onCustomRentChange?.(e.target.value);
                  onSecurityDepositChange?.(e.target.value);
                }}
                className="pl-7 md:pl-9 h-8 md:h-10 text-xs md:text-sm"
              />
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 mt-1">
              <span className="font-medium">Bed rent: ₹{displayRent}</span> •
              Room base: ₹{room?.rent_per_bed}
              {bedRent && bedRent !== room.rent_per_bed && (
                <span className="text-blue-600 ml-1">
                  (Custom rate for this bed)
                </span>
              )}
            </p>
          </div>
          <div>
            <Label
              htmlFor={`security-deposit-${bedNumber}`}
              className="text-xs md:text-sm font-medium"
            >
              Security Deposit (Optional)
            </Label>
            <div className="relative mt-1">
              <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-500" />
              <Input
                id={`security-deposit-${bedNumber}`}
                type="text"
                placeholder="Enter security deposit amount"
                value={customSecurityDeposit ?? ""}
                onChange={(e) => {
                  if (
                    !/^\d*\.?\d*$/.test(e.target.value) ||
                    Number(e.target.value) < 0
                  )
                    return;
                  onSecurityDepositChange?.(e.target.value);
                }}
                className="pl-7 md:pl-9 h-8 md:h-10 text-xs md:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected tenant preview */}
      {selectedTenant && (
        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h4 className="text-xs md:text-sm font-semibold text-blue-800">
              Selected Tenant
            </h4>
            <div className="flex items-center gap-1">
              {selectedTenant.is_active && (
                <Badge
                  variant="outline"
                  className="h-4 text-[9px] bg-green-50 text-green-700 border-green-200"
                >
                  Active
                </Badge>
              )}
              {selectedTenant.couple_id ? (
                <UsersRound className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
              ) : (
                <GenderIcon
                  gender={selectedTenant.gender || "Other"}
                  size="h-3 w-3 md:h-4 md:w-4"
                />
              )}
            </div>
          </div>

          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Name</span>
              <span className="text-xs md:text-sm font-medium">
                {selectedTenant.full_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">ID</span>
              <span className="text-xs md:text-sm font-mono">
                {selectedTenant.id}
              </span>
            </div>
            {selectedTenant.phone && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs text-gray-600">
                  Phone
                </span>
                <span className="text-xs md:text-sm flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {selectedTenant.phone}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">
                Gender
              </span>
              <span className="text-xs md:text-sm">
                {selectedTenant.couple_id
                  ? "Couple"
                  : selectedTenant.gender || "Not specified"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">
                This Bed Rent
              </span>
              <span className="text-xs md:text-sm font-medium text-green-600">
                ₹{displayRent}
              </span>
            </div>
            {selectedTenant.couple_id && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] md:text-xs text-gray-600">
                  Couple ID
                </span>
                <span className="text-xs md:text-sm font-mono">
                  {selectedTenant.couple_id}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// BED CARD COMPONENT
// ============================================
function BedCard({
  bedNumber,
  assignment,
  isOccupied,
  isVacatingSoon = false,
  isAssigning,
  onAssignClick,
  onUpdateClick,
  onDeleteClick,
  onVacateClick,
  onChangeBedClick,
  tenants,
  loadingTenants,
  roomGenderPreferences,
  currentRoomAssignments,
  isSaving,
  tenantDetails,
  room,
  bedRent,
  securityDeposit,
  onSecurityDepositChange,
  customSecurityDeposit,
  onEditClick,
  onEditSuccess,
  expectedVacateDate,
  preAssignedTenantId,
  preAssignedTenantName,
  preAssignedRent,
  preAssignedDeposit,
  preAssignedIsCouple,
  onPreAssign,
  onCancelPreAssign, 
}: {
  bedNumber: number;
  assignment: any;
  isOccupied: boolean;
  isVacatingSoon?: boolean;
  isAssigning: boolean;
  onAssignClick: () => void;
  onUpdateClick: (
  bedAssignment: any,
  tenantId: string,
  customRent?: string,
  customSecurityDeposit?: string,
) => void;
  onEditClick: (assignment: any, tenantDetails: any) => void;
  onEditSuccess: () => void;
  onDeleteClick?: () => void;
  onVacateClick: () => void;
  onChangeBedClick: () => void;
  tenants: Tenant[];
  loadingTenants: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
  isSaving: boolean;
  tenantDetails?: Tenant;
  room: RoomResponse;
  bedRent?: number;
  securityDeposit?: number;
  onSecurityDepositChange?: (deposit: string) => void;
  customSecurityDeposit?: string;
  expectedVacateDate?: string | null;
  preAssignedTenantId?: number | null;
  preAssignedTenantName?: string | null;
  preAssignedRent?: number | null;
  preAssignedDeposit?: number | null;
  preAssignedIsCouple?: boolean;
  onPreAssign: (bedAssignment: any, tenantId: string, rent?: string, deposit?: string, isCouple?: boolean) => Promise<boolean>;
  onCancelPreAssign: (bedAssignmentId: number) => void;
}) {
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [customRent, setCustomRent] = useState<string>(
    bedRent ? bedRent.toString() : room.rent_per_bed.toString(),
  );
  const [isCouple, setIsCouple] = useState<boolean>(
    assignment?.is_couple || false,
  );
  const [customSecurityDepositLocal, setCustomSecurityDepositLocal] =
    useState<string>("");

  const [isPreAssigning, setIsPreAssigning] = useState(false);
  const [preAssignTenantId, setPreAssignTenantId] = useState("");
  const [preAssignRent, setPreAssignRent] = useState("");
  const [preAssignDeposit, setPreAssignDeposit] = useState("");
  const [preAssignIsCouple, setPreAssignIsCouple] = useState(false);

  useEffect(() => {
    if (isAssigning) {
      setSelectedTenantId("");
      setCustomRent(
        bedRent ? bedRent.toString() : room.rent_per_bed.toString(),
      );
      setIsCouple(assignment?.is_couple || false);
      const defaultDeposit = bedRent
        ? bedRent.toString()
        : room.rent_per_bed.toString();
      setCustomSecurityDepositLocal(defaultDeposit);
    }
  }, [isAssigning, room.rent_per_bed, bedRent, assignment]);

  const handleUpdateClick = () => {
  onUpdateClick(
    assignment,
    selectedTenantId,
    customRent,
    customSecurityDepositLocal,
  );
};

  const displayRent = assignment?.tenant_rent || room.rent_per_bed;

  return (
    <Card
      className={`overflow-hidden ${isOccupied ? "border-green-200" : "border-gray-200"}`}
    >
      <CardContent className="p-2">
        {/* Bed Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`p-1 rounded-md ${isOccupied ? "bg-green-100" : "bg-gray-100"}`}
            >
              <Bed
                className={`h-3.5 w-3.5 ${isOccupied ? "text-green-600" : "text-gray-600"}`}
              />
            </div>
            <div>
              <h3 className="font-bold text-xs">Bed {bedNumber}</h3>
              <Badge
                variant={isOccupied ? "default" : "outline"}
                className={`text-[9px] md:text-xs ${
                  isOccupied
                    ? isVacatingSoon
                      ? "bg-amber-100 text-amber-800 border-amber-300"
                      : "bg-green-100 text-green-800 border-green-300"
                    : ""
                }`}
              >
                {isVacatingSoon ? "Vacating Soon" : isOccupied ? "Occupied" : "Available"}
              </Badge>
            </div>
          </div>
          <div
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${
              isVacatingSoon ? "bg-amber-500" : isOccupied ? "bg-green-500" : "bg-gray-300"
            }`}
          />
        </div>

        {/* Occupied Bed View */}
        {isOccupied && assignment && tenantDetails && (
          <div className="space-y-3 md:space-y-4">
            {/* Tenant Info */}
            <div className="bg-gray-50 p-1.5 rounded-lg">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-gray-800">
                    Current Tenant
                  </h4>
                  <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
                    ID: {assignment.tenant_id}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {Boolean(assignment.is_couple) && (
                    <UsersRound className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                  )}
                  <GenderIcon
                    gender={assignment.tenant_gender || ""}
                    size="h-3.5 w-3.5 md:h-4 md:w-4"
                  />
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">
                    Name
                  </span>
                  <span className="font-medium text-xs md:text-sm">
                    {tenantDetails.full_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">
                    Gender
                  </span>
                  <span className="font-medium text-xs md:text-sm">
                    {assignment.tenant_gender}
                  </span>
                </div>

                {Boolean(assignment.is_couple) &&  (() => {
                  const partnerName = tenantDetails?.partner_full_name;
                  const partnerPhone = tenantDetails?.partner_phone;
                  const partnerGender = tenantDetails?.partner_gender;
                  const partnerRelationship = tenantDetails?.partner_relationship;

                  // ✅ No partner name = partner vacated → hide entire section
                  if (!partnerName || partnerName === tenantDetails?.full_name) {
                    return null;
                  }

                  return (
                    <>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-[9px] font-semibold text-pink-600 flex items-center gap-1">
                          <Heart className="h-2.5 w-2.5" /> Partner Details
                        </p>
                      </div>
                      {tenantDetails?.couple_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">Couple ID</span>
                          <Badge variant="outline" className="text-[9px] bg-pink-50 text-pink-700">
                            {tenantDetails.couple_id}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-600">Partner Name</span>
                        <span className="font-medium text-xs md:text-sm">{partnerName}</span>
                      </div>
                      {partnerPhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">Partner Phone</span>
                          <span className="font-medium text-xs md:text-sm">{partnerPhone}</span>
                        </div>
                      )}
                      {partnerGender && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">Partner Gender</span>
                          <span className="font-medium text-xs md:text-sm">{partnerGender}</span>
                        </div>
                      )}
                      {partnerRelationship && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">Relationship</span>
                          <span className="font-medium text-xs md:text-sm">{partnerRelationship}</span>
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">
                    Status
                  </span>
                  <Badge
                    variant={tenantDetails.is_active ? "default" : "secondary"}
                    className="h-4 md:h-5 text-[9px] md:text-xs"
                  >
                    {tenantDetails.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Vacating Soon + Pre-Assignment Section */}
            {isVacatingSoon && expectedVacateDate && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-700">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-semibold">
                    Vacating soon — available from{" "}
                    {new Date(expectedVacateDate).toLocaleDateString("en-IN", { 
                      day: "2-digit", 
                      month: "short", 
                      year: "numeric" 
                    })}
                  </span>
                </div>

                {preAssignedTenantId ? (
                  <div className="bg-white rounded-md p-2 border border-amber-300">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-gray-700">Pre-Assigned Tenant</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 text-[9px] text-red-600 hover:bg-red-500 px-1.5"
                        onClick={() => onCancelPreAssign(assignment.id)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs font-medium text-gray-800">{preAssignedTenantName || 'Unknown Tenant'}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                      <span>Rent: ₹{preAssignedRent || '—'}</span>
                      <span>•</span>
                      <span>Deposit: ₹{preAssignedDeposit || '—'}</span>
                      {preAssignedIsCouple && (
                        <Badge variant="outline" className="text-[9px] bg-pink-50 text-pink-700 border-pink-200">
                          Couple
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : isPreAssigning ? (
                  <>
                    <TenantSelectDropdown
                      bedNumber={bedNumber}
                      value={preAssignTenantId}
                      onValueChange={setPreAssignTenantId}
                      tenants={tenants}
                      loading={loadingTenants}
                      roomGenderPreferences={roomGenderPreferences}
                      currentRoomAssignments={currentRoomAssignments}
                      onCustomRentChange={setPreAssignRent}
                      onIsCoupleChange={setPreAssignIsCouple}
                      onSecurityDepositChange={setPreAssignDeposit}
                      customRent={preAssignRent}
                      isCouple={preAssignIsCouple}
                      room={room}
                      bedRent={bedRent}
                      customSecurityDeposit={preAssignDeposit}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-7 text-[10px]"
                        onClick={() => setIsPreAssigning(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 h-7 text-[10px] bg-amber-600 hover:bg-amber-700"
                        onClick={async () => {
                          const success = await onPreAssign(
                            assignment, 
                            preAssignTenantId, 
                            preAssignRent, 
                            preAssignDeposit, 
                            preAssignIsCouple
                          );
                          if (success) {
                            setIsPreAssigning(false);
                          }
                        }}
                        disabled={!preAssignTenantId}
                      >
                        Confirm Pre-Assign
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-7 text-[10px] border-amber-300 text-amber-700 hover:bg-amber-500"
                    onClick={() => setIsPreAssigning(true)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Pre-Assign Tenant
                  </Button>
                )}
              </div>
            )}

            {/* Actions for Occupied Bed */}
            <div className="space-y-2 md:space-y-3">
              {isAssigning ? (
                <>
                  <TenantSelectDropdown
                    bedNumber={bedNumber}
                    value={selectedTenantId}
                    onValueChange={setSelectedTenantId}
                    tenants={tenants}
                    loading={loadingTenants}
                    roomGenderPreferences={roomGenderPreferences}
                    currentRoomAssignments={currentRoomAssignments}
                    onSecurityDepositChange={setCustomSecurityDepositLocal}
                    onCustomRentChange={setCustomRent}
                    onIsCoupleChange={setIsCouple}
                    customRent={customRent}
                    isCouple={isCouple}
                    room={room}
                    bedRent={bedRent}
                    customSecurityDeposit={customSecurityDepositLocal}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                      onClick={onAssignClick}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                      onClick={handleUpdateClick}
                      disabled={!selectedTenantId || isSaving}
                    >
                      {isSaving ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-900 h-8 md:h-9 text-[10px] md:text-xs"
                      onClick={() => onEditClick(assignment, tenantDetails)}
                      disabled={isSaving}
                    >
                      <Pencil className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-900 h-8 md:h-9 text-[10px] md:text-xs"
                      onClick={onDeleteClick}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      className="border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-900 h-8 md:h-9 text-[10px] md:text-xs"
                      onClick={onChangeBedClick}
                      disabled={isSaving}
                    >
                      <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Change Bed
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-900 h-8 md:h-9 text-[10px] md:text-xs"
                      onClick={onVacateClick}
                      disabled={isSaving}
                    >
                      <UserMinus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                      Vacate
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Available Bed View */}
        {!isOccupied && (
          <div className="space-y-2">
            {isAssigning ? (
              <>
                <TenantSelectDropdown
                  bedNumber={bedNumber}
                  value={selectedTenantId}
                  onValueChange={setSelectedTenantId}
                  tenants={tenants}
                  loading={loadingTenants}
                  roomGenderPreferences={roomGenderPreferences}
                  currentRoomAssignments={currentRoomAssignments}
                  onCustomRentChange={setCustomRent}
                  onIsCoupleChange={setIsCouple}
                  onSecurityDepositChange={setCustomSecurityDepositLocal}
                  customRent={customRent}
                  isCouple={isCouple}
                  room={room}
                  bedRent={bedRent}
                  customSecurityDeposit={customSecurityDepositLocal}
                  defaultSecurityDeposit={securityDeposit}
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                    onClick={onAssignClick}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-8 md:h-9 text-xs md:text-sm"
                    onClick={handleUpdateClick}
                    disabled={!selectedTenantId || isSaving}
                  >
                    {isSaving ? "Assigning..." : "Assign"}
                  </Button>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                className="w-full h-9 md:h-11 text-xs md:text-sm"
                onClick={onAssignClick}
                disabled={isSaving}
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                Assign Tenant
              </Button>
            )}
          </div>
        )}

        {/* Rent Info */}
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-gray-600">
              Monthly Rent
            </span>
            <div className="text-right">
              <span className="font-bold text-xs md:text-sm text-green-600">
                ₹{displayRent}
              </span>
            </div>
          </div>

          {assignment?.security_deposit && (
            <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-100">
              <span className="text-[10px] md:text-xs text-gray-600">
                Security Deposit
              </span>
              <div className="text-right">
                <span className="font-bold text-xs md:text-sm text-amber-600">
                  ₹{parseFloat(assignment.security_deposit).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN BED MANAGEMENT DIALOG COMPONENT
// ============================================
export function BedManagementDialog({
  room,
  open,
  onOpenChange,
  onRefresh,
  onRoomUpdate,
}: BedManagementDialogProps) {
  const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>(
    room.bed_assignments || [],
  );
  const [assigningBed, setAssigningBed] = useState<number | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [savingBed, setSavingBed] = useState<number | null>(null);
  const [securityDeposit, setSecurityDeposit] = useState<number>(0);
  const [securityDepositLoading, setSecurityDepositLoading] = useState(false);

  const [vacateWizardOpen, setVacateWizardOpen] = useState(false);
  const [selectedBedForVacate, setSelectedBedForVacate] =
    useState<BedAssignment | null>(null);

  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [totalSecurityDeposit, setTotalSecurityDeposit] = useState<number>(0);
  const [transferDetails, setTransferDetails] = useState<{
    bedAssignment: BedAssignment | null;
    newTenant: Tenant | null;
    existingAssignment: any | null;
    customRent?: string;
    isCouple?: boolean;
  }>({
    bedAssignment: null,
    newTenant: null,
    existingAssignment: null,
    customRent: undefined,
    isCouple: undefined,
  });
  const [transferReason, setTransferReason] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBedForEdit, setSelectedBedForEdit] = useState<any>(null);
  const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any>(null);

  const [changeBedWizardOpen, setChangeBedWizardOpen] = useState(false);
  const [selectedTenantForChange, setSelectedTenantForChange] =
    useState<Tenant | null>(null);

  const roomGenderPreferences = Array.isArray(room.room_gender_preference)
    ? room.room_gender_preference
    : typeof room.room_gender_preference === "string"
      ? room.room_gender_preference.split(",").filter(Boolean)
      : [];

  // ============================================
  // REFRESH ROOM DATA
  // ============================================
  const refreshRoomData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await getRoomById(room.id.toString());
      
      let roomData: any = null;
      if (response && (response as any).success && (response as any).data) {
        roomData = (response as any).data;
      } else if (response && (response as any).id) {
        roomData = response;
      } else {
        roomData = room;
      }

      let beds: BedAssignment[] = roomData?.bed_assignments || room.bed_assignments || [];

      let propertyId = roomData?.property_id || room?.property_id;
      
      if (!propertyId && roomData?.id) {
        try {
          const fullRoom = await getRoomById(roomData.id.toString());
          let fullRoomData: any = null;
          if (fullRoom && (fullRoom as any).success && (fullRoom as any).data) {
            fullRoomData = (fullRoom as any).data;
          } else if (fullRoom && (fullRoom as any).id) {
            fullRoomData = fullRoom;
          }
          if (fullRoomData?.property_id) {
            roomData.property_id = fullRoomData.property_id;
            propertyId = fullRoomData.property_id;
          }
        } catch (e) {
          console.error("❌ [DEBUG] Could not fetch property_id:", e);
        }
      }
      
if (propertyId) {
  try {
    const token = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");

    const vacateMap: Record<number, { date: string; status: string; tenantName: string; source: 'vacate_request' | 'notice_period' }> = {};

    // 1. Vacate requests (priority source)
    const vacateRes = await fetch(
      `/api/admin/vacate-requests?property_id=${propertyId}&limit=100`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    const vacateData = await vacateRes.json();

    if (vacateData.success && Array.isArray(vacateData.data)) {
      vacateData.data.forEach((req: any) => {
        const isCompleted = req.vacate_status === 'completed' || req.vacate_status === 'cancelled';
        if (!isCompleted && req.bed_id && req.expected_vacate_date) {
          if (!vacateMap[req.bed_id]) {
            vacateMap[req.bed_id] = {
              date: req.expected_vacate_date,
              status: req.vacate_status || 'pending',
              tenantName: req.tenant_name || 'Unknown',
              source: 'vacate_request',
            };
          }
        }
      });
    }

    // 2. Notice periods (fallback — only fills beds with no vacate request)
    // ✅ Use the same helper SideFilter uses instead of a raw fetch — the raw
    // fetch was likely failing auth silently (success:false, no throw), so
    // no notice-period entries ever made it into vacateMap.
    try {
      const noticeResult = await getActiveNoticePeriods(propertyId.toString());
      if (noticeResult.success && Array.isArray(noticeResult.data)) {
        noticeResult.data.forEach((n) => {
          if (n.bed_assignment_id && n.notice_period_date && !vacateMap[n.bed_assignment_id]) {
            vacateMap[n.bed_assignment_id] = {
              date: n.notice_period_date,
              status: 'notice_pending',
              tenantName: n.tenant_name || 'Unknown',
              source: 'notice_period',
            };
          }
        });
      } else {
        console.warn("⚠️ Notice periods fetch returned no data:", noticeResult);
      }
    } catch (noticeErr) {
      console.error("❌ Could not fetch notice periods:", noticeErr);
    }

    beds = beds.map((bed) => {
      const info = vacateMap[bed.id];
      return info
        ? {
            ...bed,
            expected_vacate_date: info.date,
            vacate_status: info.status,
            vacating_tenant_name: info.tenantName,
            vacate_source: info.source,
          }
        : { ...bed, expected_vacate_date: null, vacate_status: null, vacating_tenant_name: null, vacate_source: null };
    });
  } catch (vacateErr) {
    console.error("❌ [VACATE DEBUG] fetch failed:", vacateErr);
  }
}

      try {
        const token = localStorage.getItem("auth_token") || localStorage.getItem("admin_token");
        const bedsRes = await fetch(
          `/api/rooms/bed-assignments?room_id=${room.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const bedsData = await bedsRes.json();

        if (bedsData.success && Array.isArray(bedsData.data)) {
          const preAssignMap: Record<number, any> = {};

          bedsData.data.forEach((b: any) => {
            preAssignMap[b.id] = {
              pre_assigned_tenant_id: b.pre_assigned_tenant_id ?? null,
              pre_assigned_rent: b.pre_assigned_rent ?? null,
              pre_assigned_security_deposit: b.pre_assigned_security_deposit ?? null,
              pre_assigned_is_couple: !!b.pre_assigned_is_couple,
            };
          });

          beds = beds.map((bed) => ({
            ...bed,
            ...(preAssignMap[bed.id] ?? {}),
          }));
        }
      } catch (preErr) {
        console.error("❌ [DEBUG] Could not fetch pre-assignment data:", preErr);
      }

      setBedAssignments(beds);
      if (onRoomUpdate) {
        onRoomUpdate({ ...roomData, bed_assignments: beds });
      }
      
      setLoading(false);
    } catch (error) {
      console.error("❌ [DEBUG] Error refreshing room:", error);
      setLoading(false);
    }
  }, [room.id, room.property_id, onRoomUpdate]);

  // ============================================
  // CALCULATE TOTAL SECURITY DEPOSIT
  // ============================================
  useEffect(() => {
    const total = bedAssignments.reduce((sum, bed) => {
      if (!bed.is_available && bed.tenant_id && bed.security_deposit) {
        const deposit = typeof bed.security_deposit === 'string' 
          ? parseFloat(bed.security_deposit) 
          : bed.security_deposit;
        return sum + (isNaN(deposit) ? 0 : deposit);
      }
      return sum;
    }, 0);
    
    setTotalSecurityDeposit(total);
  }, [bedAssignments]);

  // ============================================
  // LOAD DATA ON DIALOG OPEN
  // ============================================
  useEffect(() => {
    if (open && room?.id) {
      setAssigningBed(null);
      const timer = setTimeout(() => {
        refreshRoomData();
        loadTenantsBasedOnPreferences();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open, room?.id]);

  // ============================================
  // EDIT HANDLERS
  // ============================================
  const handleEditClick = (bedAssignment: any, tenantDetails: any) => {
    setSelectedBedForEdit(bedAssignment);
    setSelectedTenantForEdit(tenantDetails);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    refreshRoomData();
    loadTenantsBasedOnPreferences();
    if (onRefresh) onRefresh();
  };

  // ============================================
  // PRE-ASSIGN HANDLERS
  // ============================================
const handlePreAssign = async (
  bedAssignment: BedAssignment,
  tenantId: string,
  rent?: string,
  deposit?: string,
) => {
  if (!tenantId.trim()) {
    toast.error("Please select a tenant");
    return false;
  }

  const tenant = tenants.find((t) => t.id.toString() === tenantId);
  if (!tenant) {
    toast.error("Invalid tenant selected");
    return false;
  }

  const tenantIdNum = parseInt(tenantId);
  const effectiveIsCouple =
    tenant.couple_id != null && tenant.is_couple_booking === true;

  // Same validation used for live assignment — check-in date, property match,
  // and (if couple) partner_full_name/phone/gender — applied identically to
  // pre-assignment so a bad pre-assign can't slip through.
  const validation = validateTenantForAssignment(tenant, room, effectiveIsCouple, tenants);
  if (!validation.valid) {
    toast.error(validation.message);
    return false;
  }

  try {
    setSavingBed(bedAssignment.bed_number);
    const { preAssignTenant } = await import("@/lib/roomsApi");
    const result = await preAssignTenant(bedAssignment.id, {
      tenant_id: tenantIdNum,
      rent: rent ? parseFloat(rent) : undefined,
      security_deposit: deposit ? parseFloat(deposit) : undefined,
      is_couple: effectiveIsCouple,
    });
    if (result.success) {
      toast.success("Tenant pre-assigned successfully");
      await refreshRoomData();
      return true;
    }
    toast.error(result.message || "Failed to pre-assign tenant");
    return false;
  } catch (err: any) {
    toast.error(err.message || "Failed to pre-assign tenant");
    return false;
  } finally {
    setSavingBed(null);
  }
};

  const handleCancelPreAssign = async (bedAssignmentId: number) => {
    try {
      const { cancelPreAssignment } = await import("@/lib/roomsApi");
      const result = await cancelPreAssignment(bedAssignmentId);
      if (result.success) {
        toast.success("Pre-assignment cancelled");
        await refreshRoomData();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel pre-assignment");
    }
  };

  // ============================================
  // TENANT VACATE CHECK
  // ============================================
  const checkIfTenantVacated = async (tenantId: number): Promise<boolean> => {
    try {
      const response = await request<ApiResult<any>>(
        `/api/tenants/${tenantId}`
      );
      
      if (response.success && response.data) {
        if (response.data.vacate_records && response.data.vacate_records.length > 0) {
          return true;
        }
        if (response.data.has_vacated === true) {
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      console.error(`Error checking vacate status for tenant ${tenantId}:`, error);
      return false;
    }
  };

  const checkTenantBedAssignmentsForVacate = async (tenantId: number): Promise<boolean> => {
    try {
      const response = await request<ApiResult<any>>(
        `/api/rooms/tenant-assignment/${tenantId}`
      );
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const hasVacatedAssignment = response.data.some(
          (assignment: any) => assignment.vacate_reason && assignment.is_available === true
        );
        return hasVacatedAssignment;
      }
      return false;
    } catch (error) {
      console.error(`Error checking bed assignments for tenant ${tenantId}:`, error);
      return false;
    }
  };

  // ============================================
  // LOAD TENANTS BASED ON PREFERENCES
  // ============================================
  const loadTenantsBasedOnPreferences = async () => {
    try {
      if (!room?.property_id) {
        console.warn("room.property_id not available yet");
        return;
      }
      setLoadingTenants(true);

      const response: any = await request<Tenant[]>(
        "/api/tenants?is_active=true&pageSize=1000",
      );

      let tenantsList: Tenant[] = [];

      if (Array.isArray(response)) {
        tenantsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        tenantsList = response.data;
      }

      const tenantsWithDetails = await Promise.all(
        tenantsList.map(async (tenant) => {
          try {
            const tenantDetails = await request<ApiResult<Tenant>>(
              `/api/tenants/${tenant.id}`,
            );

            let isVacated = false;
            
            if (tenantDetails.success && tenantDetails.data) {
              if (tenantDetails.data.vacate_records && tenantDetails.data.vacate_records.length > 0) {
                isVacated = true;
              }
              if (tenantDetails.data.has_vacated === true) {
                isVacated = true;
              }
            }
            
            if (!isVacated) {
              isVacated = await checkTenantBedAssignmentsForVacate(tenant.id);
            }

            if (tenantDetails.success && tenantDetails.data) {
              return {
                ...tenant,
                partner_full_name: tenantDetails.data.partner_full_name,
                partner_phone: tenantDetails.data.partner_phone,
                partner_email: tenantDetails.data.partner_email,
                partner_gender: tenantDetails.data.partner_gender,
                partner_date_of_birth: tenantDetails.data.partner_date_of_birth,
                partner_address: tenantDetails.data.partner_address,
                partner_occupation: tenantDetails.data.partner_occupation,
                partner_organization: tenantDetails.data.partner_organization,
                partner_relationship: tenantDetails.data.partner_relationship,
                partner_id_proof_type: tenantDetails.data.partner_id_proof_type,
                partner_id_proof_number: tenantDetails.data.partner_id_proof_number,
                partner_id_proof_url: tenantDetails.data.partner_id_proof_url,
                partner_address_proof_type: tenantDetails.data.partner_address_proof_type,
                partner_address_proof_number: tenantDetails.data.partner_address_proof_number,
                partner_address_proof_url: tenantDetails.data.partner_address_proof_url,
                partner_photo_url: tenantDetails.data.partner_photo_url,
                is_couple_booking: tenantDetails.data.is_couple_booking,
                couple_id: tenantDetails.data.couple_id,
                partner_tenant_id: tenantDetails.data.partner_tenant_id,
                is_primary_tenant: tenantDetails.data.is_primary_tenant,
                partner_is_active: tenantDetails.data.partner_is_active,
                partner_has_vacated: tenantDetails.data.partner_has_vacated,
                is_vacated: isVacated,
              };
            }
            return {
              ...tenant,
              is_vacated: isVacated,
            };
          } catch (error) {
            console.error(`Failed to fetch details for tenant ${tenant.id}:`, error);
            return {
              ...tenant,
              is_vacated: false,
            };
          }
        }),
      );

    const propertyRoomsResponse = await request<ApiResult<any>>(
        `/api/rooms/property/${room.property_id}`
      );
      
      let allAssignedTenantIds = new Set<number>();
      let coupleIdToBedNumber = new Map<number, number>(); // ✅ was assignedCoupleIds Set
      
      if (propertyRoomsResponse.success && propertyRoomsResponse.data) {
        const propertyRooms = propertyRoomsResponse.data;
        
        for (const propertyRoom of propertyRooms) {
          const assignments = propertyRoom.bed_assignments || [];
          for (const assignment of assignments) {
            if (!assignment.is_available && assignment.tenant_id) {
              allAssignedTenantIds.add(assignment.tenant_id);
              
              const assignedTenant = tenantsWithDetails.find(t => t.id === assignment.tenant_id);
              if (assignedTenant?.couple_id) {
                coupleIdToBedNumber.set(assignedTenant.couple_id, assignment.bed_number);
              }
            }
          }
        }
      }
      
      const currentRoomAssignments = bedAssignments.filter(
        (b) => !b.is_available && b.tenant_id,
      );
      
      for (const assignment of currentRoomAssignments) {
        if (assignment.tenant_id) {
          allAssignedTenantIds.add(assignment.tenant_id);
          const assignedTenant = tenantsWithDetails.find(t => t.id === assignment.tenant_id);
          if (assignedTenant?.couple_id) {
            coupleIdToBedNumber.set(assignedTenant.couple_id, assignment.bed_number);
          }
        }
      }

      const tenantsWithAssignment = tenantsWithDetails.map((tenant) => {
        const hasActiveAssignment = allAssignedTenantIds.has(tenant.id);
        
        let isPartnerOfAssigned = false;
        let partnerOfAssignedBedNumber: number | null = null;

        if (tenant.couple_id && tenant.is_couple_booking && !hasActiveAssignment) {
          const bedNum = coupleIdToBedNumber.get(tenant.couple_id);
          if (bedNum !== undefined) {
            isPartnerOfAssigned = true;
            partnerOfAssignedBedNumber = bedNum; // ✅ NEW
          }
        }
        
        return {
          ...tenant,
          is_assigned: hasActiveAssignment,
          is_partner_of_assigned: isPartnerOfAssigned,
          partner_of_assigned_bed_number: partnerOfAssignedBedNumber, // ✅ NEW
        };
      });

      const filteredTenants = tenantsWithAssignment.filter(
        (tenant) => tenant.property_id === room.property_id
      );

      setTenants(filteredTenants);
    } catch (error: any) {
      console.error("Error loading tenants:", error);
      toast.error(`Failed to load tenants: ${error.message}`);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  // ============================================
  // GET BED STATUS
  // ============================================
const getBedStatus = useCallback((bedNumber: number) => {
  const assignment = bedAssignments.find((b) => b.bed_number === bedNumber);

  if (!assignment) {
    return { status: "available", assignment: null };
  }

  const hasVacateDate = !!assignment.expected_vacate_date && assignment.expected_vacate_date !== null;
  const isAvailable = assignment.is_available;
  const hasTenant = !!assignment.tenant_id;

  if (hasVacateDate && hasTenant && !isAvailable) {
    // ✅ If the vacate request is completed/cancelled, treat as plain occupied
    if (assignment.vacate_status === 'completed' || assignment.vacate_status === 'cancelled') {
      return { status: "occupied", assignment };
    }

    // ✅ Any pending/approved vacate request (past or future date) shows as vacating_soon
    return { status: "vacating_soon", assignment };
  }

  if (!isAvailable && hasTenant) {
    return { status: "occupied", assignment };
  }
  
  return { status: "available", assignment };
}, [bedAssignments]);

  // ============================================
  // FIND TENANT DETAILS
  // ============================================
  const findTenantDetails = (tenantId: number) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (!tenant) return null;
    
    const partnerInfo = getCorrectPartnerDetails(tenant);
    
    return {
      ...tenant,
      partner_full_name: partnerInfo.partner_full_name,
      partner_phone: partnerInfo.partner_phone,
      partner_email: partnerInfo.partner_email,
      partner_gender: partnerInfo.partner_gender,
      partner_relationship: partnerInfo.partner_relationship,
    };
  };

// const getCorrectPartnerDetails = (tenant: Tenant) => {
//     // ✅ Treat partner as gone if THIS tenant's own record says so
//     // (this field comes from /api/tenants/:id → getTenantWithPartner,
//     // which checks the partner's vacate_records — same source tenant-form uses)
//     if (tenant.partner_is_active === false || tenant.partner_has_vacated === true) {
//       return {
//         partner_full_name: '',
//         partner_phone: '',
//         partner_email: '',
//         partner_gender: '',
//         partner_relationship: tenant.partner_relationship || 'Spouse',
//       };
//     }

//     if (tenant.partner_tenant_id && tenant.partner_tenant_id !== tenant.id) {
//       const partnerTenant = tenants.find(t => t.id === tenant.partner_tenant_id);
      
//       if (partnerTenant) {
//         return {
//           partner_full_name: partnerTenant.full_name,
//           partner_phone: partnerTenant.phone || '',
//           partner_email: partnerTenant.email || '',
//           partner_gender: partnerTenant.gender || '',
//           partner_relationship: tenant.partner_relationship || 'Spouse',
//         };
//       }
//     }
    
//     const primaryTenant = tenants.find(t => t.partner_tenant_id === tenant.id && t.is_primary_tenant === 1);
    
//     if (primaryTenant) {
//       return {
//         partner_full_name: primaryTenant.full_name,
//         partner_phone: primaryTenant.phone || '',
//         partner_email: primaryTenant.email || '',
//         partner_gender: primaryTenant.gender || '',
//         partner_relationship: tenant.partner_relationship || 'Spouse',
//       };
//     }
    
//     if (tenant.couple_id) {
//       const coupleTenants = tenants.filter(t => t.couple_id === tenant.couple_id && t.id !== tenant.id);
      
//       if (coupleTenants.length > 0) {
//         const partnerTenant = coupleTenants[0];
//         return {
//           partner_full_name: partnerTenant.full_name,
//           partner_phone: partnerTenant.phone || '',
//           partner_email: partnerTenant.email || '',
//           partner_gender: partnerTenant.gender || '',
//           partner_relationship: tenant.partner_relationship || 'Spouse',
//         };
//       }
//     }
    
//     return {
//       partner_full_name: tenant.partner_full_name || '',
//       partner_phone: tenant.partner_phone || '',
//       partner_email: tenant.partner_email || '',
//       partner_gender: tenant.partner_gender || '',
//       partner_relationship: tenant.partner_relationship || 'Spouse',
//     };
//   };



const getCorrectPartnerDetails = (tenant: Tenant) => {
    // ✅ CRITICAL FIX: If tenant is NOT active, they shouldn't show partner details
    // because they're either vacated or reassigned as solo
    if (!tenant.is_active) {
        return {
            partner_full_name: '',
            partner_phone: '',
            partner_email: '',
            partner_gender: '',
            partner_relationship: tenant.partner_relationship || 'Spouse',
        };
    }

    // ✅ If tenant is active but has no couple_id and no partner_tenant_id,
    // they are definitely solo → return empty partner details
    if (!tenant.couple_id && !tenant.partner_tenant_id) {
        return {
            partner_full_name: '',
            partner_phone: '',
            partner_email: '',
            partner_gender: '',
            partner_relationship: tenant.partner_relationship || 'Spouse',
        };
    }

    // ✅ For ACTIVE tenants, check if the partner exists and is still active
    if (tenant.partner_tenant_id && tenant.partner_tenant_id !== tenant.id) {
        const partnerTenant = tenants.find(t => t.id === tenant.partner_tenant_id);
        
        if (partnerTenant) {
            // ✅ Partner exists - check if they are active AND not vacated
            if (partnerTenant.is_active && !partnerTenant.is_vacated) {
                return {
                    partner_full_name: partnerTenant.full_name || '',
                    partner_phone: partnerTenant.phone || '',
                    partner_email: partnerTenant.email || '',
                    partner_gender: partnerTenant.gender || '',
                    partner_relationship: tenant.partner_relationship || 'Spouse',
                };
            } else {
                // Partner is inactive or vacated → this tenant is now solo
                return {
                    partner_full_name: '',
                    partner_phone: '',
                    partner_email: '',
                    partner_gender: '',
                    partner_relationship: tenant.partner_relationship || 'Spouse',
                };
            }
        }
    }
    
    // ✅ Check if this tenant is the partner of someone else (primary tenant lookup)
    const primaryTenant = tenants.find(t => t.partner_tenant_id === tenant.id && t.is_primary_tenant === 1);
    
    if (primaryTenant) {
        // ✅ Primary tenant exists - check if they are active AND not vacated
        if (primaryTenant.is_active && !primaryTenant.is_vacated) {
            return {
                partner_full_name: primaryTenant.full_name || '',
                partner_phone: primaryTenant.phone || '',
                partner_email: primaryTenant.email || '',
                partner_gender: primaryTenant.gender || '',
                partner_relationship: tenant.partner_relationship || 'Spouse',
            };
        } else {
            // Primary tenant is inactive or vacated → this tenant is now solo
            return {
                partner_full_name: '',
                partner_phone: '',
                partner_email: '',
                partner_gender: '',
                partner_relationship: tenant.partner_relationship || 'Spouse',
            };
        }
    }
    
    // ✅ Fallback: if couple_id exists but no partner found, clear partner details
    if (tenant.couple_id) {
        const coupleTenants = tenants.filter(t => t.couple_id === tenant.couple_id && t.id !== tenant.id);
        
        if (coupleTenants.length > 0) {
            const partnerTenant = coupleTenants[0];
            if (partnerTenant.is_active && !partnerTenant.is_vacated) {
                return {
                    partner_full_name: partnerTenant.full_name || '',
                    partner_phone: partnerTenant.phone || '',
                    partner_email: partnerTenant.email || '',
                    partner_gender: partnerTenant.gender || '',
                    partner_relationship: tenant.partner_relationship || 'Spouse',
                };
            }
        }
        // No active partner found → clear partner details
        return {
            partner_full_name: '',
            partner_phone: '',
            partner_email: '',
            partner_gender: '',
            partner_relationship: tenant.partner_relationship || 'Spouse',
        };
    }
    
    // ✅ Final fallback: return whatever's stored (will likely be empty)
    return {
        partner_full_name: tenant.partner_full_name || '',
        partner_phone: tenant.partner_phone || '',
        partner_email: tenant.partner_email || '',
        partner_gender: tenant.partner_gender || '',
        partner_relationship: tenant.partner_relationship || 'Spouse',
    };
};

  // ============================================
  // CHECK EXISTING ASSIGNMENT
  // ============================================
  const checkTenantExistingAssignment = async (
    tenantId: number,
    excludeBedAssignmentId?: number,
  ) => {
    try {
      const response = await request<ApiResult<any>>(
        `/api/rooms/tenant-assignment/${tenantId}`,
      );

      if (response.success && response.data) {
        const activeAssignments = Array.isArray(response.data)
          ? response.data.filter(
              (assignment: any) =>
                (excludeBedAssignmentId
                  ? assignment.id !== excludeBedAssignmentId
                  : true) && !assignment.is_available,
            )
          : [];

        return activeAssignments.length > 0 ? activeAssignments[0] : null;
      }
      return null;
    } catch (error) {
      console.error("Error checking tenant assignment:", error);
      return null;
    }
  };

  // ============================================
  // VACATE EXISTING ASSIGNMENT
  // ============================================
  const vacateExistingAssignment = async (
    bedAssignmentId: number,
    reason: string,
  ) => {
    try {
      const result = await request<ApiResult<any>>(
        `/api/rooms/bed-assignments/${bedAssignmentId}/vacate`,
        {
          method: "POST",
          body: JSON.stringify({ reason }),
        },
      );
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to vacate bed",
      };
    }
  };

  // ============================================
  // CHANGE BED HANDLER
  // ============================================
  const handleChangeBedClick = (bedAssignment: BedAssignment) => {
    const tenantDetails = findTenantDetails(bedAssignment.tenant_id);
    if (tenantDetails) {
      setSelectedTenantForChange(tenantDetails);
      setChangeBedWizardOpen(true);
    }
  };

  // ============================================
  // RESET STATES ON DIALOG CLOSE
  // ============================================
  useEffect(() => {
    if (!open) {
      setAssigningBed(null);
      setSavingBed(null);
      setBedAssignments(room.bed_assignments || []);
      setTenants([]);
      setLoading(false);
      setLoadingTenants(false);
      setTransferDialogOpen(false);
      setTransferDetails({
        bedAssignment: null,
        newTenant: null,
        existingAssignment: null,
        customRent: undefined,
        isCouple: undefined,
      });
      setTransferReason("");
    }
  }, [open, room.bed_assignments]);

  // ============================================
  // ASSIGN BED
  // ============================================
const handleAssignBed = async (
  bedNumber: number,
  tenantId: string,
  customRent?: string,
  customSecurityDeposit?: string,
) => {
  if (!tenantId.trim()) {
    toast.error("Please select a tenant");
    return;
  }

  const tenant = tenants.find((t) => t.id.toString() === tenantId);
  if (!tenant) {
    toast.error("Invalid tenant selected");
    return;
  }

  const tenantIdNum = parseInt(tenantId);
  const effectiveIsCouple =
    tenant.couple_id != null && tenant.is_couple_booking === true;

  // validateTenantForAssignment already checks partner_full_name / partner_phone /
  // partner_gender when isCoupleBooking is true, so this single call covers
  // check-in date, property match, AND couple completeness.
  const validation = validateTenantForAssignment(
    tenant,
    room,
    effectiveIsCouple,
    tenants,
  );
  if (!validation.valid) {
    toast.error(validation.message);
    return;
  }

  try {
    setSavingBed(bedNumber);

    const existingAssignment = await checkTenantExistingAssignment(tenantIdNum);
    if (existingAssignment) {
      setTransferDetails({
        bedAssignment: null,
        newTenant: tenant,
        existingAssignment,
        customRent,
        isCouple: effectiveIsCouple,
      });
      setTransferReason(`Moved to Bed ${bedNumber} in Room ${room.room_number}`);
      setTransferDialogOpen(true);
      setSavingBed(null);
      return;
    }

    const rentValue =
      customRent && customRent.trim() !== "" ? parseFloat(customRent) : room.rent_per_bed;
    const tenantGender = tenant.gender as "Male" | "Female" | "Other";

    const payload: AssignBedPayload = {
      room_id: room.id,
      bed_number: bedNumber,
      tenant_id: tenantIdNum,
      tenant_gender: tenantGender,
      tenant_rent: rentValue,
      security_deposit: customSecurityDeposit
        ? parseFloat(customSecurityDeposit)
        : rentValue,
      is_couple: effectiveIsCouple,
      ...(effectiveIsCouple && getCorrectPartnerDetails(tenant)),
    };

    const result = await assignBed(payload);

    if (result.success) {
      const partnerDetails = getCorrectPartnerDetails(tenant);
      const coupleMsg = effectiveIsCouple
        ? ` (Couple Booking with ${partnerDetails.partner_full_name})`
        : "";
      toast.success(`Bed ${bedNumber} assigned successfully!${coupleMsg}`);
      setSavingBed(null);
      setAssigningBed(null);
      loadTenantsBasedOnPreferences();
      refreshRoomData();
      onOpenChange(false);
      if (onRefresh) onRefresh();
    } else {
      toast.error(result.message || "Failed to assign bed");
      setSavingBed(null);
    }
  } catch (err: any) {
    console.error("Assign bed error:", err);
    toast.error(err.message || "Failed to assign bed");
    setSavingBed(null);
  }
};

// ============================================
// UPDATE BED ASSIGNMENT
// ============================================
const handleUpdateBedAssignment = async (
  bedAssignment: BedAssignment,
  tenantId: string,
  customRent?: string,
  customSecurityDeposit?: string,
) => {
  if (!tenantId.trim()) {
    toast.error("Please select a tenant");
    return;
  }

  const tenant = tenants.find((t) => t.id.toString() === tenantId);
  if (!tenant) {
    toast.error("Invalid tenant selected");
    return;
  }

  const newTenantId = parseInt(tenantId);
  const currentTenantId = bedAssignment.tenant_id;
  const effectiveIsCouple =
    tenant.couple_id != null && tenant.is_couple_booking === true;

  // Same validation used everywhere: check-in date, property match, and
  // (if couple) partner_full_name/phone/gender completeness.
  const validation = validateTenantForAssignment(
    tenant,
    room,
    effectiveIsCouple,
    tenants,
  );
  if (!validation.valid) {
    toast.error(validation.message);
    return;
  }

  // Same tenant, just editing rent/deposit -> go straight to direct update
  if (currentTenantId === newTenantId) {
    await updateBedAssignmentDirectly(
      bedAssignment,
      tenant,
      customRent,
      customSecurityDeposit,
    );
    return;
  }

  try {
    setSavingBed(bedAssignment.bed_number);

    const existingAssignment = await checkTenantExistingAssignment(
      newTenantId,
      bedAssignment.id,
    );

    if (existingAssignment) {
      setTransferDetails({
        bedAssignment: bedAssignment,
        newTenant: tenant,
        existingAssignment: existingAssignment,
        customRent: customRent,
        isCouple: effectiveIsCouple,
      });
      setTransferReason(
        `Transferred to Bed ${bedAssignment.bed_number} in Room ${room.room_number}`,
      );
      setTransferDialogOpen(true);
      setSavingBed(null);
      return;
    }

    await updateBedAssignmentDirectly(
      bedAssignment,
      tenant,
      customRent,
      customSecurityDeposit,
    );
  } catch (err: any) {
    console.error("Update bed error:", err);
    toast.error(err.message || "Failed to update bed assignment");
  } finally {
    setSavingBed(null);
  }
};

// ============================================
// UPDATE BED ASSIGNMENT DIRECTLY
// ============================================
const updateBedAssignmentDirectly = async (
  bedAssignment: BedAssignment,
  tenant: Tenant,
  customRent?: string,
  customSecurityDeposit?: string,
) => {
  const effectiveIsCouple =
    tenant.couple_id != null && tenant.is_couple_booking === true;

  const rentValue =
    customRent && customRent.trim() !== ""
      ? parseFloat(customRent)
      : room.rent_per_bed;

  const tenantGender = tenant.gender as "Male" | "Female" | "Other";

  let depositValue = rentValue;
  if (
    customSecurityDeposit !== undefined &&
    customSecurityDeposit !== null &&
    customSecurityDeposit.trim() !== ""
  ) {
    const parsedDeposit = parseFloat(customSecurityDeposit);
    if (!isNaN(parsedDeposit)) {
      depositValue = parsedDeposit;
    }
  }

  const partnerDetails = getCorrectPartnerDetails(tenant);

  const payload: UpdateBedAssignmentPayload = {
    tenant_id: tenant.id,
    tenant_gender: tenantGender,
    is_available: false,
    tenant_rent: rentValue,
    is_couple: effectiveIsCouple,
    security_deposit: depositValue,
    ...(effectiveIsCouple && {
      partner_full_name: partnerDetails.partner_full_name,
      partner_phone: partnerDetails.partner_phone,
      partner_email: partnerDetails.partner_email,
      partner_gender: partnerDetails.partner_gender,
      partner_relationship: partnerDetails.partner_relationship,
    }),
  };

  const result = await updateBedAssignment(
    bedAssignment.id.toString(),
    payload,
  );

  if (result.success) {
    const coupleMsg = effectiveIsCouple
      ? ` (Couple Booking with ${partnerDetails.partner_full_name})`
      : "";
    toast.success(
      `Bed ${bedAssignment.bed_number} updated successfully! ${tenant.full_name}${coupleMsg}`,
    );

    setSavingBed(null);
    setAssigningBed(null);

    loadTenantsBasedOnPreferences();
    refreshRoomData();

    onOpenChange(false);

    if (onRefresh) onRefresh();
  } else {
    toast.error(result.message || "Failed to update bed assignment");
  }
};

  // ============================================
  // DELETE ASSIGNMENT
  // ============================================
  const handleDeleteAssignment = async (bedAssignment: BedAssignment) => {
    if (bedAssignment.tenant_id) {
      try {
        setLoading(true);
        const tenantId = bedAssignment.tenant_id;

        const response = await request<ApiResult<any>>(
          `/api/payments/tenant/${tenantId}`,
        );

        if (response.success && response.data && response.data.length > 0) {
          const hasPayments = response.data.some(
            (payment: any) =>
              payment.status === "approved" ||
              payment.status === "pending" ||
              payment.status === "paid",
          );

          if (hasPayments) {
            toast.error(`Cannot delete assignment`, {
              description: `Tenant has existing payment transactions. Please delete all payments first.`,
              duration: 5000,
            });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error checking tenant payments:", error);
        toast.error("Unable to verify tenant payments. Please check manually.");
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      setSavingBed(bedAssignment.bed_number);

      const originalRent = bedAssignment.tenant_rent || room.rent_per_bed;

      const result = await updateBedAssignment(bedAssignment.id.toString(), {
        tenant_id: null,
        tenant_gender: null,
        is_available: true,
        tenant_rent: originalRent,
        is_couple: false,
        security_deposit: null,
      });

      if (result.success) {
        toast.success(
          `Bed ${bedAssignment.bed_number} unassigned successfully`,
        );

        setSavingBed(null);
        setAssigningBed(null);
        loadTenantsBasedOnPreferences();
        
        refreshRoomData();
        
        onOpenChange(false);

        if (onRefresh) onRefresh();
      } else {
        toast.error(result.message || "Failed to unassign bed");
        setSavingBed(null);
      }
    } catch (err: any) {
      console.error("Delete assignment error:", err);
      toast.error(err.message || "Failed to unassign bed");
      setSavingBed(null);
    }
  };

  // ============================================
  // TRANSFER CONFIRMATION
  // ============================================
  const handleTransferConfirmation = async () => {
    try {
      const {
        bedAssignment,
        newTenant,
        existingAssignment,
        customRent,
        isCouple,
      } = transferDetails;

      if (!existingAssignment || !newTenant) {
        toast.error("Invalid transfer details");
        return;
      }

      setSavingBed(bedAssignment?.bed_number || null);

      const vacateResult = await vacateExistingAssignment(
        existingAssignment.id,
        transferReason,
      );

      if (!vacateResult.success) {
        toast.error(`Failed to vacate existing bed: ${vacateResult.message}`);
        setSavingBed(null);
        return;
      }

      toast.success(`Vacated previous assignment`);

      const coupleValue = isCouple === true;
      const tenantGender = newTenant.gender as "Male" | "Female" | "Other";

      if (!bedAssignment) {
        const payload: AssignBedPayload = {
          room_id: room.id,
          bed_number: existingAssignment.bed_number || 0,
          tenant_id: newTenant.id,
          tenant_gender: tenantGender,
          tenant_rent: customRent ? parseFloat(customRent) : room.rent_per_bed,
          is_couple: coupleValue,
        };

        const result = await assignBed(payload);

        if (result.success) {
          const coupleMsg = coupleValue
            ? ` (Couple Booking with ${newTenant.partner_full_name})`
            : "";
          toast.success(`Bed ${existingAssignment.bed_number} assigned successfully!${coupleMsg}`);

          await refreshRoomData();
          await loadTenantsBasedOnPreferences();

          setAssigningBed(null);

          if (onRefresh) onRefresh();
        } else {
          toast.error(result.message || "Failed to assign bed");
        }
      } else {
        const payload: UpdateBedAssignmentPayload = {
          tenant_id: newTenant.id,
          tenant_gender: tenantGender,
          is_available: false,
          tenant_rent: customRent ? parseFloat(customRent) : room.rent_per_bed,
          is_couple: coupleValue,
          ...(coupleValue && {
            partner_full_name: newTenant.partner_full_name,
            partner_phone: newTenant.partner_phone,
            partner_email: newTenant.partner_email,
            partner_gender: newTenant.partner_gender,
            partner_date_of_birth: newTenant.partner_date_of_birth,
            partner_relationship: newTenant.partner_relationship || "Spouse",
          }),
        };

        const result = await updateBedAssignment(
          bedAssignment.id.toString(),
          payload,
        );

        if (result.success) {
          const coupleMsg = coupleValue
            ? ` (Couple Booking with ${newTenant.partner_full_name})`
            : "";
          toast.success(
            `Bed ${bedAssignment.bed_number} updated successfully! ${newTenant.full_name}${coupleMsg}`,
          );
          await refreshRoomData();
        } else {
          toast.error(result.message || "Failed to update bed assignment");
        }
      }

      setAssigningBed(null);

      if (onRefresh) onRefresh();

      setTransferDialogOpen(false);
      setTransferDetails({
        bedAssignment: null,
        newTenant: null,
        existingAssignment: null,
        customRent: undefined,
        isCouple: undefined,
      });
      setTransferReason("");
    } catch (err: any) {
      console.error("Transfer error:", err);
      toast.error(err.message || "Failed to process transfer");
    } finally {
      setSavingBed(null);
    }
  };

  // ============================================
  // VACATE CLICK
  // ============================================
  const handleVacateClick = async (bedAssignment: BedAssignment) => {
    const tenantDetails = findTenantDetails(bedAssignment.tenant_id);

    if (!tenantDetails) {
      toast.error("Tenant details not found");
      return;
    }

    try {
      setLoading(true);

      let adminToken = localStorage.getItem("auth_token");
      
      if (!adminToken) {
        adminToken = localStorage.getItem("admin_token");
      }
      
      if (!adminToken) {
        adminToken = localStorage.getItem("token");
      }
      
      if (!adminToken) {
        console.warn("⚠️ No admin token found in localStorage");
        setSelectedBedForVacate(bedAssignment);
        setVacateWizardOpen(true);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/vacate-requests?tenant_id=${tenantDetails.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${adminToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        console.error("❌ Unauthorized - token may be expired or invalid");
        setSelectedBedForVacate(bedAssignment);
        setVacateWizardOpen(true);
        setLoading(false);
        return;
      }

      const result = await response.json();

      let vacateRequests = [];
      if (result.success && Array.isArray(result.data)) {
        vacateRequests = result.data;
      }

      const tenantVacateRequest = vacateRequests.find(
        (req: any) => req.tenant_id === tenantDetails.id && 
                       req.request_status === "pending"
      );

      setSelectedBedForVacate(bedAssignment);
      setVacateWizardOpen(true);
      
    } catch (error) {
      console.error("Error checking vacate requests:", error);
      setSelectedBedForVacate(bedAssignment);
      setVacateWizardOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VACATE COMPLETE
  // ============================================
  const handleVacateComplete = async () => {
    setVacateWizardOpen(false);
    setSelectedBedForVacate(null);
    setAssigningBed(null);

    await refreshRoomData();
    await loadTenantsBasedOnPreferences();

    onOpenChange(false);

    if (onRefresh) onRefresh();
  };

  // ============================================
  // CHANGE BED SUCCESS
  // ============================================
  const handleChangeBedSuccess = () => {
    refreshRoomData();
    loadTenantsBasedOnPreferences();
    if (onRefresh) onRefresh();
    
    setChangeBedWizardOpen(false);
    setSelectedTenantForChange(null);
    
    onOpenChange(false);
  };

  // ============================================
  // CALCULATIONS
  // ============================================
  const totalBeds = room?.total_bed ?? 0;
  const occupiedBeds = bedAssignments.filter((b) => !b.is_available).length;
  const availableBedsCount = totalBeds - occupiedBeds;

  const totalRoomRent = bedAssignments.reduce((sum, bed) => {
    const bedRent = bed.tenant_rent
      ? parseFloat(bed.tenant_rent.toString())
      : room.rent_per_bed;
    return sum + (isNaN(bedRent) ? 0 : bedRent);
  }, 0);

  // ============================================
  // RENDER
  // ============================================
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 md:px-3 md:py-2 flex-shrink-0">
            <DialogHeader className="space-y-0.5 md:space-y-1">
              <DialogTitle className="text-xs md:text-base lg:text-lg font-bold">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                      <span>Bed Management - Room {room.room_number}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-white text-blue-600 w-fit"
                    >
                      {room.property_name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                    className="h-7 w-7 p-0 text-white hover:bg-white/20 flex-shrink-0 mt-0"
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-100 flex-nowrap min-w-0 justify-start">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="truncate min-w-0">
                  {room.property_address} • Floor {room.floor || "G"}
                </span>
              </div>
            </DialogHeader>
          </div>

          <div className="px-2 py-1.5 md:px-3 md:py-2 overflow-y-auto flex-1 min-h-0">
            <div className="space-y-1.5 md:space-y-2">
              {roomGenderPreferences.length > 0 && (
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Filter className="h-3 w-3 text-blue-600" />
                      <h3 className="font-semibold text-xs text-gray-800">
                        Room Preferences
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {roomGenderPreferences.map((pref: any) => {
                        const prefLower = pref.toLowerCase();
                        let label = "";

                        if (prefLower === "male_only" || prefLower === "male") {
                          label = "Male Only";
                        } else if (
                          prefLower === "female_only" ||
                          prefLower === "female"
                        ) {
                          label = "Female Only";
                        } else if (prefLower === "couples") {
                          label = "Couples";
                        } else if (
                          prefLower === "both" ||
                          prefLower === "any" ||
                          prefLower === "mixed"
                        ) {
                          label = "Mixed Gender";
                        }

                        return (
                          <Badge
                            key={pref}
                            variant="outline"
                            className="bg-white text-[9px] md:text-xs"
                          >
                            <GenderIcon
                              gender={prefLower}
                              size="h-2.5 w-2.5 md:h-3 md:w-3"
                            />
                            <span className="ml-1">{label}</span>
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-[9px] text-gray-500 mt-1">
                      Tenants will be filtered based on these preferences.
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 leading-tight">
                          Total Beds
                        </p>
                        <h3 className="text-sm font-bold text-gray-800 leading-tight">
                          {totalBeds}
                        </h3>
                      </div>
                      <Bed className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 leading-tight">
                          Occupied
                        </p>
                        <h3 className="text-sm font-bold text-green-600 leading-tight">
                          {occupiedBeds}
                        </h3>
                      </div>
                      <UserRound className="h-4 w-4 text-green-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 leading-tight">
                          Available
                        </p>
                        <h3 className="text-sm font-bold text-cyan-600 leading-tight">
                          {availableBedsCount}
                        </h3>
                      </div>
                      <UserPlus className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 leading-tight">
                          Security Deposit
                        </p>
                        <h3 className="text-sm font-bold text-amber-600 leading-tight">
                          {securityDepositLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin inline" />
                          ) : (
                            `₹${totalSecurityDeposit.toLocaleString()}`
                          )}
                        </h3>
                        <p className="text-[8px] text-gray-400 leading-tight">
                          From {bedAssignments.filter(b => !b.is_available && b.security_deposit).length} occupied bed(s)
                        </p>
                      </div>
                      <Shield className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 leading-tight">
                          Total Rent
                        </p>
                        <h3 className="text-sm font-bold text-amber-600 leading-tight">
                          ₹{totalRoomRent}
                        </h3>
                        <p className="text-[8px] text-gray-400 leading-tight">
                          {occupiedBeds} occ • ₹{room.rent_per_bed}/base
                        </p>
                      </div>
                      <BadgeIndianRupee className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Bed Assignments
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">
                      {availableBedsCount > 0 ? (
                        <span className="text-green-600 font-medium">
                          {availableBedsCount} beds available
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          Room is fully occupied
                        </span>
                      )}
                    </p>
                  </div>
                  <Badge
                    variant={availableBedsCount > 0 ? "default" : "secondary"}
                    className="text-[9px] md:text-xs"
                  >
                    {totalBeds} Beds Total
                  </Badge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
                  {Array.from({ length: totalBeds }, (_, i) => i + 1).map((bedNumber) => {
                    const { status, assignment } = getBedStatus(bedNumber);
                    const isOccupied = status === "occupied" || status === "vacating_soon";
                    const isVacatingSoon = status === "vacating_soon";
                    const tenantDetails = assignment?.tenant_id
                      ? findTenantDetails(assignment.tenant_id)
                      : null;
                    const isAssigning = assigningBed === bedNumber;
                    const isSaving = savingBed === bedNumber;

                    return (
                      <BedCard
                        key={bedNumber}
                        bedNumber={bedNumber}
                        assignment={assignment}
                        isOccupied={isOccupied}
                        isVacatingSoon={isVacatingSoon}
                        isAssigning={isAssigning}
                        isSaving={isSaving}
                        onAssignClick={() => {
                          if (isAssigning) {
                            setAssigningBed(null);
                          } else {
                            setAssigningBed(bedNumber);
                          }
                        }}
                        onUpdateClick={(
  bedAssignment,
  tenantId,
  customRent,
  customSecurityDeposit,
) => {
  if (bedAssignment) {
    handleUpdateBedAssignment(
      bedAssignment,
      tenantId,
      customRent,
      customSecurityDeposit,
    );
  } else {
    handleAssignBed(
      bedNumber,
      tenantId,
      customRent,
      customSecurityDeposit,
    );
  }
}}
                        onDeleteClick={() =>
                          assignment && handleDeleteAssignment(assignment)
                        }
                        onVacateClick={() =>
                          assignment && handleVacateClick(assignment)
                        }
                        onChangeBedClick={() =>
                          assignment && handleChangeBedClick(assignment)
                        }
                        tenants={tenants}
                        loadingTenants={loadingTenants}
                        roomGenderPreferences={roomGenderPreferences}
                        currentRoomAssignments={bedAssignments}
                        tenantDetails={tenantDetails}
                        room={room}
                        bedRent={assignment?.tenant_rent}
                        securityDeposit={securityDeposit}
                        onSecurityDepositChange={(val) => {}}
                        customSecurityDeposit=""
                        onEditClick={handleEditClick}
                        onEditSuccess={handleEditSuccess}
                        expectedVacateDate={assignment?.expected_vacate_date || null}
                        preAssignedTenantId={assignment?.pre_assigned_tenant_id}
                        preAssignedTenantName={
                          assignment?.pre_assigned_tenant_id
                            ? findTenantDetails(assignment.pre_assigned_tenant_id)?.full_name
                            : null
                        }
                        preAssignedRent={assignment?.pre_assigned_rent}
                        preAssignedDeposit={assignment?.pre_assigned_security_deposit}
                        preAssignedIsCouple={!!assignment?.pre_assigned_is_couple}
                        onPreAssign={handlePreAssign}
                        onCancelPreAssign={handleCancelPreAssign}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-2 py-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>
                Only active tenants with portal access can be assigned • Click
                "Change Bed" to move tenant
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedBedForVacate && (
        <VacateBedWizard
          open={vacateWizardOpen}
          onOpenChange={setVacateWizardOpen}
          bedAssignment={selectedBedForVacate}
          tenantDetails={findTenantDetails(selectedBedForVacate.tenant_id)}
          onVacateComplete={handleVacateComplete}
        />
      )}

      {selectedTenantForChange && (
        <ChangeBedWizard
          tenantId={selectedTenantForChange.id}
          tenantName={selectedTenantForChange.full_name}
          open={changeBedWizardOpen}
          onOpenChange={setChangeBedWizardOpen}
          onSuccess={handleChangeBedSuccess}
        />
      )}

      {selectedBedForEdit && selectedTenantForEdit && (
        <EditBedModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          bedAssignment={selectedBedForEdit}
          tenantName={selectedTenantForEdit?.full_name}
          onSuccess={handleEditSuccess}
        />
      )}

      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              Transfer Required
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Tenant is already assigned to another bed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-amber-800">
                    Transfer Tenant
                  </h4>
                  <p className="text-[10px] md:text-xs text-amber-700 mt-1">
                    <strong>{transferDetails.newTenant?.full_name}</strong> will
                    be moved from their current bed.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label
                htmlFor="transfer-reason"
                className="text-xs md:text-sm font-medium"
              >
                Reason for Transfer
              </Label>
              <Textarea
                id="transfer-reason"
                placeholder="Enter reason for transferring..."
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                className="mt-2 min-h-[60px] md:min-h-[80px] text-xs md:text-sm"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferDialogOpen(false);
                setTransferDetails({
                  bedAssignment: null,
                  newTenant: null,
                  existingAssignment: null,
                  customRent: undefined,
                  isCouple: undefined,
                });
                setTransferReason("");
              }}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferConfirmation}
              disabled={!transferReason.trim()}
              className="h-8 md:h-9 text-xs md:text-sm"
            >
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}