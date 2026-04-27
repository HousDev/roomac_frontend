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
import Swal from "sweetalert2";
import MySwal from "@/app/utils/swal";
import React from "react";

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
  check_in_date?: string; // Add this field
  property_id?: number;
  property_name?: string;
  // Partner fields
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

// Add this helper function at the top of the component (after the imports)
const validateTenantForAssignment = (
  tenant: Tenant,
  room: RoomResponse,
  isCoupleBooking: boolean,
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

// Tenant Selection Dropdown Component
// Tenant Selection Dropdown Component (Fixed)
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

  // Filter only unassigned tenants AND NOT partners of already assigned tenants
  const unassignedTenants = tenants.filter(
    (tenant) => !tenant.is_assigned && !tenant.is_partner_of_assigned,
  );

  // Filter based on room preferences
  const filteredTenants = unassignedTenants.filter((tenant) => {
    const tenantGender = tenant.gender?.toLowerCase();
    const tenantIsCouple = tenant.couple_id != null;

    // For rooms with both male and female preference
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

    // Get assigned genders in current room (excluding the current bed)
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
      return tenantGender === "male" && !tenantIsCouple;
    }

    // For female-only rooms
    if (hasFemaleOnly && !hasMaleOnly) {
      return tenantGender === "female" && !tenantIsCouple;
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

  // Apply search filter - using useMemo to prevent re-renders
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

  // Sort tenants: couples first, then by name
  const sortedTenants = React.useMemo(() => {
    return [...searchedTenants].sort((a, b) => {
      if (a.couple_id && !b.couple_id) return -1;
      if (!a.couple_id && b.couple_id) return 1;
      return a.full_name?.localeCompare(b.full_name || "") || 0;
    });
  }, [searchedTenants]);

  // Get selected tenant
  const selectedTenant = tenants.find((t) => t.id.toString() === value);

  // Determine the rent to show in the input
  const displayRent = bedRent || room.rent_per_bed;

  // Handle dropdown open state
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset search when dropdown closes
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
                // IMPORTANT: Prevent click from closing dropdown
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                }}
                // Focus the input when dropdown opens
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
                    // Prevent search input from losing focus when clicking items
                    onPointerDown={(e) => {
                      e.stopPropagation();
                    }}
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
                          {tenant.is_active && (
                            <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs md:text-sm truncate flex items-center gap-2">
                            {tenant.full_name}
                            {tenant.couple_id && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-red-50 text-red-700 border-red-200"
                              >
                                Couple
                              </Badge>
                            )}
                            {tenant.is_active && (
                              <Badge
                                variant="outline"
                                className="h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-green-50 text-green-700 border-green-200"
                              >
                                Active
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

      {/* Rest of your component remains the same */}
      {/* Couple Checkbox, Custom Rent Input, Selected tenant preview... */}
      
      {/* Couple Checkbox - Only show when room allows couples */}
      {roomGenderPreferences.some((pref) => pref.toLowerCase() === "couples") &&
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
                // Keep the same rent (don't double)
                onCustomRentChange?.(String(currentRent));
                if (onIsCoupleChange) {
                  onIsCoupleChange(newValue);
                }
              }}
              className="h-3 w-3 md:h-4 md:w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <Label
              htmlFor={`is-couple-${bedNumber}`}
              className="text-xs md:text-sm font-medium text-gray-700"
            >
              Mark as Couple Booking
            </Label>
          </div>
        )}

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
                  onCustomRentChange?.(e.target.value);
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

// Bed Card Component
function BedCard({
  bedNumber,
  assignment,
  isOccupied,
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
}: {
  bedNumber: number;
  assignment: any;
  isOccupied: boolean;
  isAssigning: boolean;
  onAssignClick: () => void;
  onUpdateClick: (
    bedAssignment: any,
    tenantId: string,
    customRent?: string,
    isCouple?: boolean,
    customSecurityDeposit?: string,
  ) => void;
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
  securityDeposit?: number; // ← ADD THIS
  onSecurityDepositChange?: (deposit: string) => void; // ← ADD THIS
  customSecurityDeposit?: string; // ← ADD THIS
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

  // Reset form when assigning state changes
  useEffect(() => {
    if (isAssigning) {
      setSelectedTenantId("");
      setCustomRent(
        bedRent ? bedRent.toString() : room.rent_per_bed.toString(),
      );
      setIsCouple(assignment?.is_couple || false);
      // Set security deposit default to the bed's rent value
      const defaultDeposit = bedRent
        ? bedRent.toString()
        : room.rent_per_bed.toString();
      setCustomSecurityDepositLocal(defaultDeposit);
    }
  }, [isAssigning, room.rent_per_bed, bedRent, assignment]);

  const handleUpdateClick = () => {
    const selectedTenant = tenants.find(
      (t) => t.id.toString() === selectedTenantId,
    );
    onUpdateClick(
      assignment,
      selectedTenantId,
      customRent,
      isCouple,
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
                    ? "bg-green-100 text-green-800 border-green-300"
                    : ""
                }`}
              >
                {isOccupied ? "Occupied" : "Available"}
              </Badge>
            </div>
          </div>
          <div
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${isOccupied ? "bg-green-500" : "bg-gray-300"}`}
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

                {/* Show Partner Details from Tenant if it's a couple booking */}
                {Boolean(assignment.is_couple) &&
                  tenantDetails.partner_full_name && (
                    <>
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-[9px] font-semibold text-pink-600 flex items-center gap-1">
                          <Heart className="h-2.5 w-2.5" /> Partner Details
                        </p>
                      </div>
                      {tenantDetails.couple_id && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">
                            Couple ID
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-pink-50 text-pink-700"
                          >
                            {tenantDetails.couple_id}
                          </Badge>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] md:text-xs text-gray-600">
                          Partner Name
                        </span>
                        <span className="font-medium text-xs md:text-sm">
                          {tenantDetails.partner_full_name}
                        </span>
                      </div>
                      {tenantDetails.partner_phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">
                            Partner Phone
                          </span>
                          <span className="font-medium text-xs md:text-sm">
                            {tenantDetails.partner_phone}
                          </span>
                        </div>
                      )}
                      {tenantDetails.partner_gender && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">
                            Partner Gender
                          </span>
                          <span className="font-medium text-xs md:text-sm">
                            {tenantDetails.partner_gender}
                          </span>
                        </div>
                      )}
                      {tenantDetails.partner_relationship && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">
                            Relationship
                          </span>
                          <span className="font-medium text-xs md:text-sm">
                            {tenantDetails.partner_relationship}
                          </span>
                        </div>
                      )}
                      {tenantDetails.partner_occupation && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] md:text-xs text-gray-600">
                            Partner Occupation
                          </span>
                          <span className="font-medium text-xs md:text-sm">
                            {tenantDetails.partner_occupation}
                          </span>
                        </div>
                      )}
                    </>
                  )}

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
                    customSecurityDeposit={customSecurityDepositLocal} // ← CHANGE THIS - use the local state, not the prop from parent
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
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-900 h-8 md:h-9 text-[10px] md:text-xs col-span-2"
                      onClick={onDeleteClick}
                      disabled={isSaving}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                      Delete Assignment
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
                  onSecurityDepositChange={setCustomSecurityDepositLocal} // ← ADD THIS
                  customRent={customRent}
                  isCouple={isCouple}
                  room={room}
                  bedRent={bedRent}
                  customSecurityDeposit={customSecurityDepositLocal} // ← CHANGE THIS - use the local state
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

          {/* Security Deposit Display */}
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

  // State for vacate wizard
  const [vacateWizardOpen, setVacateWizardOpen] = useState(false);
  const [selectedBedForVacate, setSelectedBedForVacate] =
    useState<BedAssignment | null>(null);

  // State for transfer confirmation dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
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

  // State for Change Bed wizard
  const [changeBedWizardOpen, setChangeBedWizardOpen] = useState(false);
  const [selectedTenantForChange, setSelectedTenantForChange] =
    useState<Tenant | null>(null);

  const roomGenderPreferences = Array.isArray(room.room_gender_preference)
    ? room.room_gender_preference
    : typeof room.room_gender_preference === "string"
      ? room.room_gender_preference.split(",").filter(Boolean)
      : [];

  // Function to refresh room data
  const refreshRoomData = async () => {
    try {
      const response = await getRoomById(room.id.toString());
      if (response) {
        // Update local state
        setBedAssignments(response.bed_assignments || []);

        // ✅ Notify parent component about the update
        if (onRoomUpdate) {
          onRoomUpdate(response);
        }
      }
    } catch (error) {
      console.error("Error refreshing room:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadTenantsBasedOnPreferences();
      setBedAssignments(room.bed_assignments || []);
      setAssigningBed(null);
    }
  }, [open, room]);

  const loadTenantsBasedOnPreferences = async () => {
    try {
      setLoadingTenants(true);

      const response: any = await request<Tenant[]>(
        "/api/tenants?is_active=true&portal_access_enabled=true",
      );

      let tenantsList: Tenant[] = [];

      if (Array.isArray(response)) {
        tenantsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        tenantsList = response.data;
      }

      // ✅ Fetch full tenant details including partner info for each tenant
      const tenantsWithDetails = await Promise.all(
        tenantsList.map(async (tenant) => {
          try {
            // Fetch full tenant details including partner info
            const tenantDetails = await request<ApiResult<Tenant>>(
              `/api/tenants/${tenant.id}`,
            );
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
                partner_id_proof_number:
                  tenantDetails.data.partner_id_proof_number,
                partner_id_proof_url: tenantDetails.data.partner_id_proof_url,
                partner_address_proof_type:
                  tenantDetails.data.partner_address_proof_type,
                partner_address_proof_number:
                  tenantDetails.data.partner_address_proof_number,
                partner_address_proof_url:
                  tenantDetails.data.partner_address_proof_url,
                partner_photo_url: tenantDetails.data.partner_photo_url,
                is_couple_booking: tenantDetails.data.is_couple_booking,
                couple_id: tenantDetails.data.couple_id,
                partner_tenant_id: tenantDetails.data.partner_tenant_id,
              };
            }
            return tenant;
          } catch (error) {
            console.error(
              `Failed to fetch details for tenant ${tenant.id}:`,
              error,
            );
            return tenant;
          }
        }),
      );

      // Get all current assignments in this room
      const currentRoomAssignments = bedAssignments.filter(
        (b) => !b.is_available && b.tenant_id,
      );
      const currentTenantIds = currentRoomAssignments.map((b) => b.tenant_id);

      // Get couple IDs of already assigned tenants
      const assignedCoupleIds = new Set<number>();
      for (const tenantId of currentTenantIds) {
        const assignedTenant = tenantsWithDetails.find(
          (t) => t.id === tenantId,
        );
        if (assignedTenant?.couple_id) {
          assignedCoupleIds.add(assignedTenant.couple_id);
        }
      }

      // Check assignment status for each tenant
      const tenantsWithAssignment = await Promise.all(
        tenantsWithDetails.map(async (tenant) => {
          try {
            const assignmentCheck = await request<ApiResult<any>>(
              `/api/rooms/tenant-assignment/${tenant.id}`,
            );
            const isAssigned =
              assignmentCheck.success &&
              assignmentCheck.data &&
              Array.isArray(assignmentCheck.data) &&
              assignmentCheck.data.length > 0 &&
              assignmentCheck.data.some(
                (assignment: any) => !assignment.is_available,
              );

            const isPartnerOfAssigned =
              tenant.couple_id && assignedCoupleIds.has(tenant.couple_id);

            return {
              ...tenant,
              is_assigned: isAssigned,
              is_partner_of_assigned: isPartnerOfAssigned,
            };
          } catch {
            return {
              ...tenant,
              is_assigned: false,
              is_partner_of_assigned: false,
            };
          }
        }),
      );

      setTenants(tenantsWithAssignment);
    } catch (error: any) {
      console.error("Error loading tenants:", error);
      toast.error(`Failed to load tenants: ${error.message}`);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const getBedStatus = (bedNumber: number) => {
    const assignment = bedAssignments.find((b) => b.bed_number === bedNumber);

    if (!assignment) return { status: "available", assignment: null };

    if (!assignment.is_available && assignment.tenant_id) {
      return { status: "occupied", assignment };
    }
    return { status: "available", assignment };
  };

  // In BedManagementDialog.tsx

  const findTenantDetails = (tenantId: number) => {
    // Don't filter by is_assigned here - we need to find the tenant regardless
    const tenant = tenants.find((t) => t.id === tenantId);

    return tenant;
  };

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

  // Handle Change Bed Click
  const handleChangeBedClick = (bedAssignment: BedAssignment) => {
    const tenantDetails = findTenantDetails(bedAssignment.tenant_id);
    if (tenantDetails) {
      setSelectedTenantForChange(tenantDetails);
      setChangeBedWizardOpen(true);
    }
  };

  // Add this useEffect to reset all states when dialog closes
  useEffect(() => {
    if (!open) {
      // Reset all states when dialog closes
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

  const handleAssignBed = async (
    bedNumber: number,
    tenantId: string,
    customRent?: string,
    isCouple?: boolean,
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
    const isCoupleBooking = isCouple === true;

    const validation = validateTenantForAssignment(
      tenant,
      room,
      isCoupleBooking,
    );
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    try {
      setSavingBed(bedNumber);

      const existingAssignment =
        await checkTenantExistingAssignment(tenantIdNum);

      if (existingAssignment) {
        setTransferDetails({
          bedAssignment: null,
          newTenant: tenant,
          existingAssignment: existingAssignment,
          customRent: customRent,
          isCouple: isCouple,
        });
        setTransferReason(
          `Moved to Bed ${bedNumber} in Room ${room.room_number}`,
        );
        setTransferDialogOpen(true);
        setSavingBed(null);
        return;
      }

      const rentValue =
        customRent && customRent.trim() !== ""
          ? parseFloat(customRent)
          : room.rent_per_bed;

      const tenantGender = tenant.gender as "Male" | "Female" | "Other";
      const coupleValue = isCouple === true;

      let depositValue = securityDeposit;
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

      const payload: AssignBedPayload = {
        room_id: room.id,
        bed_number: bedNumber,
        tenant_id: tenantIdNum,
        tenant_gender: tenantGender,
        tenant_rent: rentValue,
        security_deposit: customSecurityDeposit
          ? parseFloat(customSecurityDeposit)
          : rentValue,
        is_couple: coupleValue,
        ...(coupleValue && {
          partner_full_name: tenant.partner_full_name,
          partner_phone: tenant.partner_phone,
          partner_email: tenant.partner_email,
          partner_gender: tenant.partner_gender,
          partner_date_of_birth: tenant.partner_date_of_birth,
          partner_address: tenant.partner_address,
          partner_occupation: tenant.partner_occupation,
          partner_organization: tenant.partner_organization,
          partner_relationship: tenant.partner_relationship || "Spouse",
        }),
      };

      const result = await assignBed(payload);

      if (result.success) {
        const coupleMsg = coupleValue
          ? ` (Couple Booking with ${tenant.partner_full_name})`
          : "";
        toast.success(`Bed ${bedNumber} assigned successfully!${coupleMsg}`);

        // Reset saving state before closing
        setSavingBed(null);
        setAssigningBed(null);

        // CLOSE THE DIALOG FIRST
        onOpenChange(false);

        // THEN REFRESH DATA IN BACKGROUND
        refreshRoomData();
        loadTenantsBasedOnPreferences();

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

  const handleUpdateBedAssignment = async (
    bedAssignment: BedAssignment,
    tenantId: string,
    customRent?: string,
    isCouple?: boolean,
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
    const isCoupleBooking = isCouple === true;

    // Validate tenant before assignment (skip if same tenant - we're just updating rent/couple status)
    if (currentTenantId !== newTenantId) {
      const validation = validateTenantForAssignment(
        tenant,
        room,
        isCoupleBooking,
      );
      if (!validation.valid) {
        toast.error(validation.message);
        return;
      }
    } else {
      // Even for same tenant, if it's a couple booking, validate partner details
      if (isCoupleBooking) {
        if (!tenant.partner_full_name || !tenant.partner_phone) {
          toast.error(
            `Couple booking requires partner details for "${tenant.full_name}". Please add partner's full name and phone number in tenant profile.`,
          );
          return;
        }
        if (!tenant.partner_gender) {
          toast.error(
            `Couple booking requires partner's gender for "${tenant.full_name}". Please update partner details in tenant profile.`,
          );
          return;
        }
      }
    }

    if (currentTenantId === newTenantId) {
      await updateBedAssignmentDirectly(
        bedAssignment,
        tenant,
        customRent,
        isCouple,
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
          isCouple: isCouple,
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
        isCouple,
        customSecurityDeposit,
      );
    } catch (err: any) {
      console.error("Update bed error:", err);
      toast.error(err.message || "Failed to update bed assignment");
    } finally {
      setSavingBed(null);
    }
  };

  const updateBedAssignmentDirectly = async (
    bedAssignment: BedAssignment,
    tenant: Tenant,
    customRent?: string,
    isCouple?: boolean,
    customSecurityDeposit?: string,
  ) => {
    const rentValue =
      customRent && customRent.trim() !== ""
        ? parseFloat(customRent)
        : room.rent_per_bed;

    const tenantGender = tenant.gender as "Male" | "Female" | "Other";
    const coupleValue = isCouple === true;

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

    const payload: UpdateBedAssignmentPayload = {
      tenant_id: tenant.id,
      tenant_gender: tenantGender,
      is_available: false,
      tenant_rent: rentValue,
      is_couple: coupleValue,
      security_deposit: depositValue,
      ...(coupleValue && {
        partner_full_name: tenant.partner_full_name,
        partner_phone: tenant.partner_phone,
        partner_email: tenant.partner_email,
        partner_gender: tenant.partner_gender,
        partner_date_of_birth: tenant.partner_date_of_birth,
        partner_address: tenant.partner_address,
        partner_occupation: tenant.partner_occupation,
        partner_organization: tenant.partner_organization,
        partner_relationship: tenant.partner_relationship || "Spouse",
      }),
    };

    const result = await updateBedAssignment(
      bedAssignment.id.toString(),
      payload,
    );

    if (result.success) {
      const coupleMsg = coupleValue
        ? ` (Couple Booking with ${tenant.partner_full_name})`
        : "";
      toast.success(
        `Bed ${bedAssignment.bed_number} updated successfully! ${tenant.full_name}${coupleMsg}`,
      );

      // Reset saving state before closing
      setSavingBed(null);
      setAssigningBed(null);

      // CLOSE THE DIALOG FIRST
      onOpenChange(false);

      // THEN REFRESH DATA IN BACKGROUND
      refreshRoomData();
      loadTenantsBasedOnPreferences();

      if (onRefresh) onRefresh();
    } else {
      toast.error(result.message || "Failed to update bed assignment");
    }
  };

  const handleDeleteAssignment = async (bedAssignment: BedAssignment) => {
    // Payment check
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

        // Reset saving state before closing
        setSavingBed(null);
        setAssigningBed(null);

        // CLOSE THE DIALOG FIRST
        onOpenChange(false);

        // THEN REFRESH DATA IN BACKGROUND
        refreshRoomData();
        loadTenantsBasedOnPreferences();

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
            ? ` (Couple Booking with ${tenant.partner_full_name})`
            : "";
          toast.success(`Bed ${bedNumber} assigned successfully!${coupleMsg}`);

          // ✅ Refresh the bed assignments AND reload tenants (only once)
          await refreshRoomData();
          await loadTenantsBasedOnPreferences();

          // ✅ Close the assigning state for this bed
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
          // Refresh bed assignments
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

  // const handleVacateClick = async (bedAssignment: BedAssignment) => {
  //   const tenantDetails = findTenantDetails(bedAssignment.tenant_id);

  //   if (!tenantDetails) {
  //     toast.error("Tenant details not found");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const adminToken = localStorage.getItem("auth_token");

  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/api/admin/vacate-requests`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Authorization: `Bearer ${adminToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );

  //     const result = await response.json();

  //     let vacateRequests = [];
  //     if (result.success && Array.isArray(result.data)) {
  //       vacateRequests = result.data;
  //     }

  //     // Filter for this tenant
  //     const tenantRequests = vacateRequests.filter(
  //       (req: any) => req.tenant_id === tenantDetails.id,
  //     );

  //     console.log(
  //       `🔍 Found ${tenantRequests.length} vacate requests for tenant ${tenantDetails.id}`,
  //     );

  //     // TEMPORARY FIX: Since API doesn't return status,
  //     // if ANY request exists for this tenant, allow vacate
  //     const hasAnyRequest = tenantRequests.length > 0;

  //     if (!hasAnyRequest) {
  //       // ✅ ONLY CHANGE THIS - Toast UI
  //       toast.error(`Cannot vacate bed`, {
  //         description: `${tenantDetails.full_name} has not submitted any vacate request. Please ask them to submit one first.`,
  //         duration: 4000,
  //       });
  //       return;
  //     }

  //     // Open wizard
  //     console.log(`✅ Tenant has vacate request, opening wizard...`);
  //     setSelectedBedForVacate(bedAssignment);
  //     setVacateWizardOpen(true);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     // ✅ ONLY CHANGE THIS - Toast UI
  //     toast.error("Unable to verify vacate request", {
  //       description: "Please check manually or try again later.",
  //       duration: 4000,
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // Alternative version - checks but auto-proceeds
const handleVacateClick = async (bedAssignment: BedAssignment) => {
  const tenantDetails = findTenantDetails(bedAssignment.tenant_id);

  if (!tenantDetails) {
    toast.error("Tenant details not found");
    return;
  }

  try {
    setLoading(true);

    const adminToken = localStorage.getItem("auth_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/admin/vacate-requests`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const result = await response.json();

    let vacateRequests = [];
    if (result.success && Array.isArray(result.data)) {
      vacateRequests = result.data;
    }

    const tenantRequests = vacateRequests.filter(
      (req: any) => req.tenant_id === tenantDetails.id,
    );

    const hasAnyRequest = tenantRequests.length > 0;

    if (!hasAnyRequest) {
      // ✅ Log it but don't show alert - just proceed
      console.log(`⚠️ No vacate request found for ${tenantDetails.full_name}, proceeding with admin vacate anyway`);
    } else {
      console.log(`✅ Found ${tenantRequests.length} vacate request(s) for ${tenantDetails.full_name}`);
    }

    // ✅ Directly open wizard regardless of request status
    setSelectedBedForVacate(bedAssignment);
    setVacateWizardOpen(true);
    
  } catch (error) {
    console.error("Error checking vacate requests:", error);
    // ✅ Still open wizard even if API fails
    setSelectedBedForVacate(bedAssignment);
    setVacateWizardOpen(true);
  } finally {
    setLoading(false);
  }
};

  const handleVacateComplete = async () => {
    // Refresh the bed assignments
    await refreshRoomData();

    loadTenantsBasedOnPreferences();

    setSelectedBedForVacate(null);
    setAssigningBed(null);

    toast.success("Bed vacated successfully!");

    if (onRefresh) onRefresh();
  };

  const handleChangeBedSuccess = () => {
    loadTenantsBasedOnPreferences();
    if (onRefresh) onRefresh();
  };

  const totalBeds = room.total_bed;
  const occupiedBeds = bedAssignments.filter((b) => !b.is_available).length;
  const availableBedsCount = totalBeds - occupiedBeds;

  // Calculate total room rent from bed assignments using tenant_rent
  const totalRoomRent = bedAssignments.reduce((sum, bed) => {
    const bedRent = bed.tenant_rent
      ? parseFloat(bed.tenant_rent.toString())
      : room.rent_per_bed;
    return sum + (isNaN(bedRent) ? 0 : bedRent);
  }, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[85vh] overflow-hidden p-0 border-0 flex flex-col rounded-2xl">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 md:px-3 md:py-2 flex-shrink-0">
            <DialogHeader className="space-y-0.5 md:space-y-1">
              <DialogTitle className="text-xs md:text-base lg:text-lg font-bold flex items-center gap-2 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="flex-1">
                    Bed Management - Room {room.room_number}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] md:text-[10px] px-1.5 py-0.5 bg-white text-blue-600"
                  >
                    {room.property_name}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-7 md:h-8 px-2 md:px-3 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                </Button>
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-100 flex-wrap">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="truncate">
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
                            `₹${securityDeposit.toLocaleString()}`
                          )}
                        </h3>
                        <p className="text-[8px] text-gray-400 leading-tight">
                          Per booking
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
                  {Array.from({ length: totalBeds }, (_, i) => i + 1).map(
                    (bedNumber) => {
                      const { status, assignment } = getBedStatus(bedNumber);
                      const isOccupied = status === "occupied";
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
                            isCouple,
                            customSecurityDeposit,
                          ) => {
                            if (bedAssignment) {
                              handleUpdateBedAssignment(
                                bedAssignment,
                                tenantId,
                                customRent,
                                isCouple,
                                customSecurityDeposit,
                              );
                            } else {
                              handleAssignBed(
                                bedNumber,
                                tenantId,
                                customRent,
                                isCouple,
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
                          securityDeposit={securityDeposit} // ← ADD THIS
                          onSecurityDepositChange={(val) => {}} // ← ADD THIS (or pass a handler)
                          customSecurityDeposit=""
                        />
                      );
                    },
                  )}
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
