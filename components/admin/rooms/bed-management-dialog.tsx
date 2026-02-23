
// components/admin/rooms/BedManagementDialog.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import {
  Bed, MapPin, UserPlus, UserMinus, BadgeIndianRupee,
  ClipboardList, AlertCircle, Check, X,
  UserRound, Eye, Filter, Save,
  UsersRound, Mail, Phone, Search,
  ChevronDown, RefreshCw
} from 'lucide-react';
import { getAvailableBeds, assignBed, updateBedAssignment, getRoomById } from '@/lib/roomsApi';
import { request } from '@/lib/api';
import type { RoomResponse, BedAssignment } from '@/lib/roomsApi';
import { VacateBedWizard } from '@/components/admin/rooms/VacateBedWizard';
import { ChangeBedWizard } from '@/components/admin/rooms/ChangeBedWizard';

interface BedManagementDialogProps {
  room: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface BedAssignmentState {
  tenantId: string;
  selectedTenant: any | null;
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
}

interface ApiResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

const GenderIcon = ({ gender, size = "h-4 w-4" }: { gender: string; size?: string }) => {
  switch (gender.toLowerCase()) {
    case 'male':
    case 'male_only':
      return <UserRound className={`${size} text-blue-600`} />;
    case 'female':
    case 'female_only':
      return <UserRound className={`${size} text-pink-600`} />;
    case 'couples':
    case 'couple':
      return <UsersRound className={`${size} text-red-600`} />;
    default:
      return <UserRound className={`${size} text-gray-600`} />;
  }
};

// Cleaned up Tenant Selection Dropdown Component
function TenantSelectDropdown({
  bedNumber,
  value,
  onValueChange,
  tenants,
  loading,
  roomGenderPreferences,
  currentRoomAssignments
}: {
  bedNumber: number;
  value: string;
  onValueChange: (value: string) => void;
  tenants: Tenant[];
  loading: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only unassigned tenants
  const unassignedTenants = tenants.filter(tenant => !tenant.is_assigned);
  
  // Filter based on room preferences and current assignments
  const filteredTenants = unassignedTenants.filter(tenant => {
    const tenantGender = tenant.gender?.toLowerCase();
    const tenantIsCouple = tenant.couple_id != null;
    
    // For rooms with both male and female preference
    const hasBothGenders = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
    );
    
    const hasMaleOnly = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'male_only' || p.toLowerCase() === 'male'
    );
    
    const hasFemaleOnly = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'female_only' || p.toLowerCase() === 'female'
    );
    
    const hasCouplesAllowed = roomGenderPreferences.some(p => 
      p.toLowerCase() === 'couples'
    );
    
    // Get assigned genders in current room (excluding the current bed)
    const assignedGenders = currentRoomAssignments
      .filter(assignment => assignment.bed_number !== bedNumber && assignment.tenant_gender)
      .map(assignment => assignment.tenant_gender?.toLowerCase());
    
    // For rooms with both male and female (mixed gender rooms)
    if (hasBothGenders) {
      return !tenantIsCouple; // Don't show couples unless explicitly allowed
    }
    
    // For male-only rooms
    if (hasMaleOnly && !hasFemaleOnly) {
      return tenantGender === 'male' && !tenantIsCouple;
    }
    
    // For female-only rooms
    if (hasFemaleOnly && !hasMaleOnly) {
      return tenantGender === 'female' && !tenantIsCouple;
    }
    
    // For rooms that allow both male and female (but not "both" preference)
    if (hasMaleOnly && hasFemaleOnly) {
      // If one gender is already assigned, only show that gender
      if (assignedGenders.length > 0) {
        const assignedGender = assignedGenders[0];
        if (assignedGender === 'male') {
          return tenantGender === 'male' && !tenantIsCouple;
        } else if (assignedGender === 'female') {
          return tenantGender === 'female' && !tenantIsCouple;
        }
      }
      // If no assignments yet, show both genders
      return (tenantGender === 'male' || tenantGender === 'female') && !tenantIsCouple;
    }
    
    // For couples rooms
    if (hasCouplesAllowed) {
      return true; // Couples rooms can have any tenant (individuals or couples)
    }
    
    return true;
  });

  // Apply search filter
  const searchedTenants = searchQuery 
    ? filteredTenants.filter(tenant => 
        tenant.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tenant.phone?.includes(searchQuery) ||
        tenant.id?.toString().includes(searchQuery)
      )
    : filteredTenants;

  // Sort tenants: couples first, then by name
  const sortedTenants = [...searchedTenants].sort((a, b) => {
    if (a.couple_id && !b.couple_id) return -1;
    if (!a.couple_id && b.couple_id) return 1;
    return a.full_name?.localeCompare(b.full_name || '') || 0;
  });

  // Get selected tenant
  const selectedTenant = tenants.find(t => t.id.toString() === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs md:text-sm font-medium">Select Tenant</Label>
        <span className="text-[10px] md:text-xs text-gray-500">
          {sortedTenants.length} available
        </span>
      </div>
      
      <Select value={value} onValueChange={onValueChange} disabled={loading}>
        <SelectTrigger className="h-8 md:h-10">
          <SelectValue placeholder={
            loading ? "Loading..." : 
            sortedTenants.length > 0 ? "Choose a tenant" : 
            "No tenants available"
          } />
        </SelectTrigger>
        <SelectContent className="max-h-[350px] p-0">
          {/* Search inside dropdown */}
          <div className="sticky top-0 z-10 bg-white border-b p-2 md:p-3">
            <div className="relative">
              <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-500" />
              <Input
                placeholder="Search tenants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 md:pl-9 h-7 md:h-9 text-xs md:text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Tenant list */}
          <div className="max-h-[250px] overflow-y-auto">
            {loading ? (
              <div className="p-4 md:p-6 text-center">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-xs md:text-sm text-gray-500 mt-2">Loading tenants...</p>
              </div>
            ) : sortedTenants.length === 0 ? (
              <div className="p-4 md:p-6 text-center">
                <UserRound className="h-6 w-6 md:h-8 md:w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs md:text-sm font-medium text-gray-600">No tenants found</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                  {searchQuery ? "Try a different search" : "All tenants are assigned"}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {sortedTenants.map(tenant => (
                  <SelectItem 
                    key={tenant.id} 
                    value={tenant.id.toString()}
                    className="py-2 md:py-3"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="relative">
                        {tenant.couple_id ? (
                          <UsersRound className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                        ) : (
                          <GenderIcon gender={tenant.gender || 'Other'} size="h-4 w-4 md:h-5 md:w-5" />
                        )}
                        {tenant.is_active && (
                          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs md:text-sm truncate">
                          {tenant.full_name}
                          {tenant.couple_id && (
                            <Badge variant="outline" className="ml-1 md:ml-2 h-4 md:h-5 px-1 md:px-1.5 text-[9px] md:text-xs bg-red-50 text-red-700 border-red-200">
                              Couple
                            </Badge>
                          )}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1 md:gap-2 mt-0.5">
                          <span>ID: {tenant.id}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {tenant.gender || 'Not specified'}
                          </span>
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

      {/* Selected tenant preview */}
      {selectedTenant && (
        <div className="mt-2 md:mt-3 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <h4 className="text-xs md:text-sm font-semibold text-blue-800">Selected Tenant</h4>
            {selectedTenant.couple_id ? (
              <UsersRound className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
            ) : (
              <GenderIcon gender={selectedTenant.gender || 'Other'} size="h-3 w-3 md:h-4 md:w-4" />
            )}
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Name</span>
              <span className="text-xs md:text-sm font-medium">{selectedTenant.full_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">ID</span>
              <span className="text-xs md:text-sm font-mono">{selectedTenant.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Gender</span>
              <span className="text-xs md:text-sm">{selectedTenant.couple_id ? 'Couple' : selectedTenant.gender || 'Not specified'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] md:text-xs text-gray-600">Status</span>
              <Badge variant={selectedTenant.is_active ? "default" : "secondary"} className="h-4 md:h-5 text-[9px] md:text-xs">
                {selectedTenant.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          {selectedTenant.phone && (
            <div className="mt-1 md:mt-2 pt-1 md:pt-2 border-t border-blue-100">
              <div className="flex items-center gap-1 md:gap-2">
                <Phone className="h-2.5 w-2.5 md:h-3 md:w-3 text-gray-500" />
                <span className="text-[10px] md:text-xs">{selectedTenant.phone}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Updated Bed Card Component with Change Bed button
function BedCard({
  bedNumber,
  assignment,
  isOccupied,
  isAssigning,
  onAssignClick,
  onUpdateClick,
  onVacateClick,
  onChangeBedClick,
  tenants,
  loadingTenants,
  roomGenderPreferences,
  currentRoomAssignments,
  isSaving,
  tenantDetails,
  room // Added room prop
}: {
  bedNumber: number;
  assignment: any;
  isOccupied: boolean;
  isAssigning: boolean;
  onAssignClick: () => void;
  onUpdateClick: (tenantId: string) => void;
  onVacateClick: () => void;
  onChangeBedClick: () => void;
  tenants: Tenant[];
  loadingTenants: boolean;
  roomGenderPreferences: string[];
  currentRoomAssignments: BedAssignment[];
  isSaving: boolean;
  tenantDetails?: any;
  room: RoomResponse; // Added room prop
}) {
  const [selectedTenantId, setSelectedTenantId] = useState('');

  return (
    <Card className={`overflow-hidden ${isOccupied ? 'border-green-200' : 'border-gray-200'}`}>
      <CardContent className="p-3 md:p-4">
        {/* Bed Header */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className={`p-1.5 md:p-2 rounded-lg ${isOccupied ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Bed className={`h-4 w-4 md:h-5 md:w-5 ${isOccupied ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-base md:text-lg">Bed {bedNumber}</h3>
              <Badge variant={isOccupied ? "default" : "outline"} className={`text-[9px] md:text-xs ${
                isOccupied ? 'bg-green-100 text-green-800 border-green-300' : ''
              }`}>
                {isOccupied ? 'Occupied' : 'Available'}
              </Badge>
            </div>
          </div>
          <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${isOccupied ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>

        {/* Occupied Bed View */}
        {isOccupied && assignment && tenantDetails && (
          <div className="space-y-3 md:space-y-4">
            {/* Tenant Info */}
            <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-gray-800">Current Tenant</h4>
                  <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">ID: {assignment.tenant_id}</p>
                </div>
                <GenderIcon gender={assignment.tenant_gender || ''} size="h-3.5 w-3.5 md:h-4 md:w-4" />
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Name</span>
                  <span className="font-medium text-xs md:text-sm">{tenantDetails.full_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Gender</span>
                  <span className="font-medium text-xs md:text-sm">{assignment.tenant_gender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] md:text-xs text-gray-600">Status</span>
                  <Badge variant={tenantDetails.is_active ? "default" : "secondary"} className="h-4 md:h-5 text-[9px] md:text-xs">
                    {tenantDetails.is_active ? 'Active' : 'Inactive'}
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
                      onClick={() => onUpdateClick(selectedTenantId)}
                      disabled={!selectedTenantId || isSaving}
                    >
                      {isSaving ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
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
          <div className="space-y-3 md:space-y-4">
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
                    onClick={() => onUpdateClick(selectedTenantId)}
                    disabled={!selectedTenantId || isSaving}
                  >
                    {isSaving ? 'Assigning...' : 'Assign'}
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
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-xs text-gray-600">Monthly Rent</span>
            <span className="font-bold text-xs md:text-sm text-green-600">₹{assignment?.rent_per_bed || room.rent_per_bed}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BedManagementDialog({ room, open, onOpenChange, onRefresh }: BedManagementDialogProps) {
  const [bedAssignments, setBedAssignments] = useState<BedAssignment[]>(room.bed_assignments || []);
  const [assigningBed, setAssigningBed] = useState<number | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [savingBed, setSavingBed] = useState<number | null>(null);
  
  // State for vacate wizard
  const [vacateWizardOpen, setVacateWizardOpen] = useState(false);
  const [selectedBedForVacate, setSelectedBedForVacate] = useState<BedAssignment | null>(null);
  
  // State for transfer confirmation dialog
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferDetails, setTransferDetails] = useState<{
    bedAssignment: BedAssignment | null;
    newTenant: any | null;
    existingAssignment: any | null;
  }>({
    bedAssignment: null,
    newTenant: null,
    existingAssignment: null
  });
  const [transferReason, setTransferReason] = useState('');

  // State for Change Bed wizard
  const [changeBedWizardOpen, setChangeBedWizardOpen] = useState(false);
  const [selectedTenantForChange, setSelectedTenantForChange] = useState<Tenant | null>(null);

  const roomGenderPreferences = Array.isArray(room.room_gender_preference) 
    ? room.room_gender_preference 
    : typeof room.room_gender_preference === 'string'
      ? room.room_gender_preference.split(',').filter(Boolean)
      : [];

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
      
      const response : any = await request<Tenant[]>('/api/tenants?is_active=true&portal_access_enabled=true');
      
      let tenantsList: Tenant[] = [];
      
      if (Array.isArray(response)) {
        tenantsList = response;
      } else if (response.data && Array.isArray(response.data)) {
        tenantsList = response.data;
      }
      
      // Check assignment status for each tenant
      const tenantsWithAssignment = await Promise.all(
        tenantsList.map(async (tenant) => {
          try {
            const assignmentCheck = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenant.id}`);
            return {
              ...tenant,
              is_assigned: assignmentCheck.success && assignmentCheck.data && 
                           Array.isArray(assignmentCheck.data) && 
                           assignmentCheck.data.length > 0 &&
                           assignmentCheck.data.some((assignment: any) => !assignment.is_available)
            };
          } catch {
            return {
              ...tenant,
              is_assigned: false
            };
          }
        })
      );
      
      setTenants(tenantsWithAssignment);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      toast.error(`Failed to load tenants: ${error.message}`);
      setTenants([]);
    } finally {
      setLoadingTenants(false);
    }
  };

  const getBedStatus = (bedNumber: number) => {
    const assignment = bedAssignments.find(b => b.bed_number === bedNumber);
    if (!assignment) return { status: 'available', assignment: null };
    
    if (!assignment.is_available && assignment.tenant_id) {
      return { status: 'occupied', assignment };
    }
    return { status: 'available', assignment };
  };

  const findTenantDetails = (tenantId: number) => {
    return tenants.find(t => t.id === tenantId);
  };

  const checkTenantExistingAssignment = async (tenantId: number, excludeBedAssignmentId?: number) => {
    try {
      const response = await request<ApiResult<any>>(`/api/rooms/tenant-assignment/${tenantId}`);
      
      if (response.success && response.data) {
        const activeAssignments = Array.isArray(response.data) 
          ? response.data.filter((assignment: any) => 
              (excludeBedAssignmentId ? assignment.id !== excludeBedAssignmentId : true) && 
              !assignment.is_available
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

  const vacateExistingAssignment = async (bedAssignmentId: number, reason: string) => {
    try {
      const result = await request<ApiResult<any>>(`/api/rooms/bed-assignments/${bedAssignmentId}/vacate`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      return result;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to vacate bed'
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

  const handleAssignBed = async (bedNumber: number, tenantId: string) => {
    if (!tenantId.trim()) {
      toast.error("Please select a tenant");
      return;
    }

    const tenant = tenants.find(t => t.id.toString() === tenantId);
    if (!tenant) {
      toast.error("Invalid tenant selected");
      return;
    }

    const tenantIdNum = parseInt(tenantId);
    
    try {
      setSavingBed(bedNumber);
      
      // Check if tenant is already assigned elsewhere
      const existingAssignment = await checkTenantExistingAssignment(tenantIdNum);
      
      if (existingAssignment) {
        setTransferDetails({
          bedAssignment: null,
          newTenant: tenant,
          existingAssignment: existingAssignment
        });
        setTransferReason(`Moved to Bed ${bedNumber} in Room ${room.room_number}`);
        setTransferDialogOpen(true);
        setSavingBed(null);
        return;
      }
      
      const payload = {
        room_id: room.id,
        bed_number: bedNumber,
        tenant_id: tenantIdNum,
        tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other'
      };

      const result = await assignBed(payload);
      
      if (result.success) {
        toast.success(`Bed ${bedNumber} assigned successfully!`);
        
        const newAssignment: BedAssignment = {
          id: result.data?.id || Date.now(),
          bed_number: bedNumber,
          room_id: room.id,
          tenant_id: tenantIdNum,
          tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
          is_available: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setBedAssignments(prev => {
          const filtered = prev.filter(b => b.bed_number !== bedNumber);
          return [...filtered, newAssignment];
        });
        
        setAssigningBed(null);
        
        if (onRefresh) onRefresh();
        
      } else {
        toast.error(result.message || "Failed to assign bed");
      }
    } catch (err: any) {
      console.error("Assign bed error:", err);
      toast.error(err.message || "Failed to assign bed");
    } finally {
      setSavingBed(null);
    }
  };

  const handleUpdateBedAssignment = async (bedAssignment: BedAssignment, tenantId: string) => {
    if (!tenantId.trim()) {
      toast.error("Please select a tenant");
      return;
    }

    const tenant = tenants.find(t => t.id.toString() === tenantId);
    if (!tenant) {
      toast.error("Invalid tenant selected");
      return;
    }

    const newTenantId = parseInt(tenantId);
    const currentTenantId = bedAssignment.tenant_id;

    if (currentTenantId === newTenantId) {
      await updateBedAssignmentDirectly(bedAssignment, tenant);
      return;
    }

    try {
      setSavingBed(bedAssignment.bed_number);
      
      const existingAssignment = await checkTenantExistingAssignment(newTenantId, bedAssignment.id);
      
      if (existingAssignment) {
        setTransferDetails({
          bedAssignment: bedAssignment,
          newTenant: tenant,
          existingAssignment: existingAssignment
        });
        setTransferReason(`Transferred to Bed ${bedAssignment.bed_number} in Room ${room.room_number}`);
        setTransferDialogOpen(true);
        setSavingBed(null);
        return;
      }
      
      await updateBedAssignmentDirectly(bedAssignment, tenant);
      
    } catch (err: any) {
      console.error("Update bed error:", err);
      toast.error(err.message || "Failed to update bed assignment");
    } finally {
      setSavingBed(null);
    }
  };

  const updateBedAssignmentDirectly = async (bedAssignment: BedAssignment, tenant: Tenant) => {
    const result = await updateBedAssignment(bedAssignment.id.toString(), {
      tenant_id: tenant.id,
      tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
      is_available: false
    });
    
    if (result.success) {
      toast.success(`Bed ${bedAssignment.bed_number} updated successfully!`);
      
      const updatedAssignment: BedAssignment = {
        ...bedAssignment,
        tenant_id: tenant.id,
        tenant_gender: tenant.gender as 'Male' | 'Female' | 'Other',
        is_available: false,
        updated_at: new Date().toISOString()
      };
      
      setBedAssignments(prev => 
        prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
      );
      
      setAssigningBed(null);
      
      if (onRefresh) onRefresh();
    } else {
      toast.error(result.message || "Failed to update bed assignment");
    }
  };

  const handleTransferConfirmation = async () => {
    try {
      const { bedAssignment, newTenant, existingAssignment } = transferDetails;
      
      if (!existingAssignment || !newTenant) {
        toast.error("Invalid transfer details");
        return;
      }

      setSavingBed(bedAssignment?.bed_number || null);
      
      const vacateResult = await vacateExistingAssignment(existingAssignment.id, transferReason);
      
      if (!vacateResult.success) {
        toast.error(`Failed to vacate existing bed: ${vacateResult.message}`);
        setSavingBed(null);
        return;
      }
      
      toast.success(`Vacated previous assignment`);
      
      if (!bedAssignment) {
        const payload = {
          room_id: room.id,
          bed_number: transferDetails.existingAssignment?.bed_number || 0,
          tenant_id: newTenant.id,
          tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other'
        };

        const result = await assignBed(payload);
        
        if (result.success) {
          const newBedAssignment: BedAssignment = {
            id: result.data?.id || Date.now(),
            bed_number: payload.bed_number,
            room_id: room.id,
            tenant_id: newTenant.id,
            tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
            is_available: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setBedAssignments(prev => {
            const filtered = prev.filter(b => b.bed_number !== payload.bed_number);
            return [...filtered, newBedAssignment];
          });
        } else {
          toast.error(result.message || "Failed to assign bed");
        }
      } else {
        const result = await updateBedAssignment(bedAssignment.id.toString(), {
          tenant_id: newTenant.id,
          tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
          is_available: false
        });
        
        if (result.success) {
          const updatedAssignment: BedAssignment = {
            ...bedAssignment,
            tenant_id: newTenant.id,
            tenant_gender: newTenant.gender as 'Male' | 'Female' | 'Other',
            is_available: false,
            updated_at: new Date().toISOString()
          };
          
          setBedAssignments(prev => 
            prev.map(b => b.id === bedAssignment.id ? updatedAssignment : b)
          );
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
        existingAssignment: null
      });
      setTransferReason('');
      
    } catch (err: any) {
      console.error("Transfer error:", err);
      toast.error(err.message || "Failed to process transfer");
    } finally {
      setSavingBed(null);
    }
  };

  const handleVacateClick = (bedAssignment: BedAssignment) => {
    setSelectedBedForVacate(bedAssignment);
    setVacateWizardOpen(true);
  };

  const handleVacateComplete = () => {
  console.log('🔄 Vacate complete - refreshing data...');
  
  // 1. Immediately update local state to show bed as available
  setBedAssignments(prev => 
    prev.map(bed => 
      bed.id === selectedBedForVacate?.id 
        ? { ...bed, tenant_id: null, tenant_gender: null, is_available: true }
        : bed
    )
  );
  
  // 2. Refresh the parent data
  if (onRefresh) {
    console.log('🔄 Calling parent refresh...');
    onRefresh(); // This should reload the rooms list
  }
  
  // 3. Refresh tenants list
  loadTenantsBasedOnPreferences();
  
  // 4. Clear the selected bed
  setSelectedBedForVacate(null);
  setAssigningBed(null);
  
  // 5. Show success message
  toast.success('Bed vacated successfully! Occupants updated.');
  
  // 6. Force a direct refresh of room data
  const refreshRoomData = async () => {
    try {
      const response = await getRoomById(room.id.toString());
      if (response) {
        console.log('🔄 Room data refreshed');
        setBedAssignments(response.bed_assignments || []);
      }
    } catch (error) {
      console.error('Error refreshing room:', error);
    }
  };
  
  refreshRoomData();
};

  const handleChangeBedSuccess = () => {
    // Refresh data after successful bed change
    loadTenantsBasedOnPreferences();
    if (onRefresh) onRefresh();
  };

  const totalBeds = room.total_bed;
  const occupiedBeds = bedAssignments.filter(b => !b.is_available).length;
  const availableBedsCount = totalBeds - occupiedBeds;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-4xl lg:max-w-6xl max-h-[90vh] overflow-hidden p-0 border-0 flex flex-col">
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-2 md:px-4 md:py-3 flex-shrink-0">
            <DialogHeader className="space-y-0.5 md:space-y-1">
              <DialogTitle className="text-sm md:text-base lg:text-lg font-bold flex items-center gap-2 justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                  <span className="flex-1">Bed Management - Room {room.room_number}</span>
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
                  Close
                </Button>
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-blue-100 flex-wrap">
                <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0" />
                <span className="truncate">{room.property_address} • Floor {room.floor || 'G'}</span>
              </div>
            </DialogHeader>
          </div>

          <div className="px-3 py-2 md:px-4 md:py-2.5 overflow-y-auto flex-1 min-h-0">
            {/* Room Info & Stats */}
            <div className="space-y-2 md:space-y-3">
              {/* Room Preferences */}
              {roomGenderPreferences.length > 0 && (
                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                      <Filter className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                      <h3 className="font-semibold text-xs md:text-sm text-gray-800">Room Preferences</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {roomGenderPreferences.map((pref:any) => {
                        const prefLower = pref.toLowerCase();
                        let label = '';
                        
                        if (prefLower === 'male_only' || prefLower === 'male') {
                          label = 'Male Only';
                        } else if (prefLower === 'female_only' || prefLower === 'female') {
                          label = 'Female Only';
                        } else if (prefLower === 'couples') {
                          label = 'Couples';
                        } else if (prefLower === 'both' || prefLower === 'any' || prefLower === 'mixed') {
                          label = 'Mixed Gender';
                        }
                        
                        return (
                          <Badge key={pref} variant="outline" className="bg-white text-[9px] md:text-xs">
                            <GenderIcon gender={prefLower} size="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span className="ml-1">{label}</span>
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 md:mt-2">
                      Tenants will be filtered based on these preferences.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Total Beds</p>
                        <h3 className="text-lg md:text-2xl font-bold text-gray-800">{totalBeds}</h3>
                      </div>
                      <Bed className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Occupied</p>
                        <h3 className="text-lg md:text-2xl font-bold text-green-600">{occupiedBeds}</h3>
                      </div>
                      <UserRound className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Available</p>
                        <h3 className="text-lg md:text-2xl font-bold text-cyan-600">{availableBedsCount}</h3>
                      </div>
                      <UserPlus className="h-6 w-6 md:h-8 md:w-8 text-cyan-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-2 md:p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] md:text-xs text-gray-600">Rent per Bed</p>
                        <h3 className="text-lg md:text-2xl font-bold text-amber-600">₹{room.rent_per_bed}</h3>
                      </div>
                      <BadgeIndianRupee className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bed Assignments */}
              <div>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-bold flex items-center gap-1.5 md:gap-2">
                      <ClipboardList className="h-4 w-4 md:h-5 md:w-5" />
                      Bed Assignments
                    </h3>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1">
                      {availableBedsCount > 0 ? (
                        <span className="text-green-600 font-medium">{availableBedsCount} beds available</span>
                      ) : (
                        <span className="text-amber-600">Room is fully occupied</span>
                      )}
                    </p>
                  </div>
                  <Badge variant={availableBedsCount > 0 ? "default" : "secondary"} className="text-[9px] md:text-xs">
                    {totalBeds} Beds Total
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3">
                  {Array.from({ length: totalBeds }, (_, i) => i + 1).map(bedNumber => {
                    const { status, assignment } = getBedStatus(bedNumber);
                    const isOccupied = status === 'occupied';
                    const tenantDetails = assignment?.tenant_id ? findTenantDetails(assignment.tenant_id) : null;
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
                        onUpdateClick={(tenantId) => {
                          if (assignment) {
                            handleUpdateBedAssignment(assignment, tenantId);
                          } else {
                            handleAssignBed(bedNumber, tenantId);
                          }
                        }}
                        onVacateClick={() => assignment && handleVacateClick(assignment)}
                        onChangeBedClick={() => assignment && handleChangeBedClick(assignment)}
                        tenants={tenants}
                        loadingTenants={loadingTenants}
                        roomGenderPreferences={roomGenderPreferences}
                        currentRoomAssignments={bedAssignments}
                        tenantDetails={tenantDetails}
                        room={room}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t px-3 py-2 md:px-4 md:py-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-gray-600">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span>Only active tenants with portal access can be assigned • Click "Change Bed" to move tenant</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vacate Wizard Dialog */}
      {selectedBedForVacate && (
        <VacateBedWizard
          open={vacateWizardOpen}
          onOpenChange={setVacateWizardOpen}
          bedAssignment={selectedBedForVacate}
          tenantDetails={findTenantDetails(selectedBedForVacate.tenant_id)}
          onVacateComplete={handleVacateComplete}
        />
      )}

      {/* Change Bed Wizard Dialog */}
      {selectedTenantForChange && (
        <ChangeBedWizard
          tenantId={selectedTenantForChange.id}
          tenantName={selectedTenantForChange.full_name}
          open={changeBedWizardOpen}
          onOpenChange={setChangeBedWizardOpen}
          onSuccess={handleChangeBedSuccess}
        />
      )}

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">Transfer Required</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Tenant is already assigned to another bed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 md:space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-xs md:text-sm text-amber-800">Transfer Tenant</h4>
                  <p className="text-[10px] md:text-xs text-amber-700 mt-1">
                    <strong>{transferDetails.newTenant?.full_name}</strong> will be moved from their current bed.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transfer-reason" className="text-xs md:text-sm font-medium">
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
                  existingAssignment: null
                });
                setTransferReason('');
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