// components/tenant/tenant-requests/TenantRequestsClient.tsx
'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, FileText, Plus, Loader2, Send, AlertTriangle, Check, Info, Home } from 'lucide-react';
import { format } from 'date-fns';

// Import extracted components
import { QuickRequestCards } from './QuickRequestCards';
import { RequestFilters } from './RequestFilters';
import { RequestCard } from './RequestCard';
import { ChangeBedForm } from './ChangeBedForm';
import { QUICK_REQUESTS, MAINTENANCE_CATEGORIES, VISIT_TIMES, MAINTENANCE_LOCATIONS, type RequestFormData } from './requestConfig';

// Import API functions
import {
  createTenantRequest,
  getMyTenantRequests,
  getTenantContractDetails,
  getCurrentRoomInfo,
  getActiveProperties,
  getChangeBedReasons,
  getAvailableRooms,
  getAvailableBedsForRoom,
  getLeaveTypes,
  getComplaintCategories,
  getComplaintReasons,
  type TenantRequest,
  type Property as ApiProperty,
  type Room as ApiRoom,
  type ChangeReason,
  type CurrentRoomInfo,
  type ComplaintCategory,
  type ComplaintReason,
  type LeaveType
} from "@/lib/tenantRequestsApi";

// import { getActiveMasterValuesByCode } from "@/lib/masterApi";
// import TenantHeader from '@/components/layout/tenantHeader';
import { getTenantToken } from "@/lib/tenantAuthApi";

// Main component - handles all authentication and data loading
export default function TenantRequestsClient() {
  const router = useRouter();
  
  // Refs to prevent infinite loops
  const isMounted = useRef(true);
  const isDataLoaded = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 2;
  
  // State management
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<RequestFormData>({
    request_type: 'general',
    title: '',
    description: '',
    priority: 'medium'
  });
  
  // Change bed form state
  const [step, setStep] = useState<number>(1);
  const [currentRoom, setCurrentRoom] = useState<CurrentRoomInfo | null>(null);
  const [changeReasons, setChangeReasons] = useState<ChangeReason[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [availableRooms, setAvailableRooms] = useState<ApiRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [availableBeds, setAvailableBeds] = useState<number[]>([]);
  const [selectedBedNumber, setSelectedBedNumber] = useState<number | null>(null);
  
  // Complaint state
  const [complaintCategories, setComplaintCategories] = useState<ComplaintCategory[]>([]);
  const [complaintReasons, setComplaintReasons] = useState<ComplaintReason[]>([]);
  const [selectedComplaintCategory, setSelectedComplaintCategory] = useState<number | null>(null);
  const [showCustomReason, setShowCustomReason] = useState(false);
  
  // Other data
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [vacateReasons, setVacateReasons] = useState<any[]>([]);
  const [lockinInfo, setLockinInfo] = useState<any>(null);
  const [noticeInfo, setNoticeInfo] = useState<any>(null);
  const [secondaryReasonsInput, setSecondaryReasonsInput] = useState('');

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      isDataLoaded.current = false;
      retryCount.current = 0;
    };
  }, []);

  // Check authentication on mount
  useEffect(() => {
    const token = getTenantToken();
    if (!token) {
      toast.error('Authentication required. Please login.');
      router.push('/login');
      return;
    }
    
    // Only load data if not already loaded
    if (!isDataLoaded.current && !initialLoadComplete) {
      loadAllData();
    }
  }, [router, initialLoadComplete]);

  // Load all data
  const loadAllData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isDataLoaded.current) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Check authentication first
      const token = getTenantToken();
      if (!token) {
        if (isMounted.current) {
          toast.error('Authentication required');
          router.push('/login');
        }
        return;
      }

      // Load all data in parallel with error handling for each
      const results = await Promise.allSettled([
        getMyTenantRequests().catch(err => {
          console.error('Failed to fetch tenant requests:', err);
          return [];
        }),
        getTenantContractDetails().catch(err => {
          console.error('Failed to fetch contract details:', err);
          return { lockinInfo: null, noticeInfo: null };
        }),
        getCurrentRoomInfo().catch(err => {
          console.error('Failed to fetch current room:', err);
          return null;
        }),
        getActiveProperties().catch(err => {
          console.error('Failed to fetch properties:', err);
          return [];
        }),
        getChangeBedReasons().catch(err => {
          console.error('Failed to fetch change reasons:', err);
          return [];
        }),
        getActiveMasterValuesByCode('VACATE_REASON').catch(err => {
          console.error('Failed to fetch vacate reasons:', err);
          return { success: true, data: [] };
        }),
        getLeaveTypes().catch(err => {
          console.error('Failed to fetch leave types:', err);
          return [];
        }),
        getComplaintCategories().catch(err => {
          console.error('Failed to fetch complaint categories:', err);
          return [];
        })
      ]);

      // Only update state if component is still mounted
      if (!isMounted.current) return;

      // Handle requests data
      if (results[0].status === 'fulfilled') {
        setRequests(results[0].value);
      }

      // Handle contract data
      if (results[1].status === 'fulfilled') {
        const contractData = results[1].value;
        setLockinInfo(contractData.lockinInfo || null);
        setNoticeInfo(contractData.noticeInfo || null);
      }

      // Handle room info
      if (results[2].status === 'fulfilled') {
        setCurrentRoom(results[2].value);
      }

      // Handle properties
      if (results[3].status === 'fulfilled') {
        setProperties(results[3].value);
      }

      // Handle change reasons
      if (results[4].status === 'fulfilled') {
        setChangeReasons(results[4].value);
      }

      // Handle vacate reasons
      if (results[5].status === 'fulfilled') {
        const response = results[5].value;
        if (response && response.success && Array.isArray(response.data)) {
          setVacateReasons(response.data);
        }
      }

      // Handle leave types
      if (results[6].status === 'fulfilled') {
        setLeaveTypes(results[6].value);
      }

      // Handle complaint categories
      if (results[7].status === 'fulfilled') {
        const categories = results[7].value;
        if (Array.isArray(categories)) {
          setComplaintCategories(categories);
        }
      }

      // Mark as loaded successfully
      isDataLoaded.current = true;
      setInitialLoadComplete(true);
      retryCount.current = 0;

    } catch (error: any) {
      console.error('Error loading data:', error);
      
      // Only handle errors if component is still mounted
      if (!isMounted.current) return;
      
      // Check for authentication errors
      if (error.message?.includes('Authentication') || 
          error.message?.includes('token') || 
          error.message?.includes('401')) {
        toast.error('Authentication failed. Please login again.');
        router.push('/login');
      } else if (retryCount.current < MAX_RETRIES) {
        // Retry with exponential backoff
        retryCount.current += 1;
        const delay = 1000 * Math.pow(2, retryCount.current - 1);
        
        setTimeout(() => {
          if (isMounted.current) {
            loadAllData();
          }
        }, delay);
      } else {
        toast.error('Failed to load data after multiple attempts. Please refresh the page.');
        setLoading(false);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [router]); 

  const refreshData = useCallback(async () => {
    // Reset loaded flag to allow reload
    isDataLoaded.current = false;
    await loadAllData();
  }, [loadAllData]);

  // Memoized values
  const filteredRequests = useMemo(() => {
    if (activeFilter === 'all') return requests;
    return requests.filter(req => req.status === activeFilter);
  }, [requests, activeFilter]);

  const requestCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: requests.length,
      pending: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    requests.forEach(req => {
      if (req.status in counts) {
        counts[req.status]++;
      }
    });

    return counts;
  }, [requests]);

  // Event handlers
  const handleQuickRequest = useCallback((type: string) => {
    const typeTitles: Record<string, string> = {
      'complaint': 'Complaint',
      'maintenance': 'Maintenance Request',
      'vacate_bed': 'Vacate Bed Request',
      'change_bed': 'Change Bed Request',
      'receipt': 'Receipt Request',
      'leave': 'Leave Application',
      'general': 'General Request'
    };

    setFormData({
      request_type: type,
      title: typeTitles[type] || 'General Request',
      description: '',
      priority: type === 'maintenance' || type === 'complaint' ? 'high' : 'medium'
    });

    if (type === 'change_bed') {
      setStep(1);
      setSelectedPropertyId(null);
      setAvailableRooms([]);
      setSelectedRoomId(null);
      setAvailableBeds([]);
      setSelectedBedNumber(null);
    }

    setIsDialogOpen(true);
  }, []);

  const handlePropertySelect = useCallback(async (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setSelectedRoomId(null);
    setAvailableBeds([]);
    setSelectedBedNumber(null);

    try {
      const rooms = await getAvailableRooms(propertyId);
      if (isMounted.current) {
        setAvailableRooms(rooms);
      }

      setFormData(prev => ({
        ...prev,
        changeBedData: {
          ...prev.changeBedData,
          preferred_property_id: propertyId,
          preferred_room_id: undefined,
          preferred_bed_number: undefined
        }
      }));
    } catch (error) {
      console.error('Error loading available rooms:', error);
      toast.error('Failed to load available rooms');
    }
  }, []);

  const handleRoomSelect = useCallback(async (roomId: number) => {
    setSelectedRoomId(roomId);
    setSelectedBedNumber(null);

    try {
      const beds = await getAvailableBedsForRoom(roomId);

      if (isMounted.current) {
        if (Array.isArray(beds)) {
          const bedNumbers = beds.filter(bed => typeof bed === 'number');
          setAvailableBeds(bedNumbers);
        } else {
          console.error('Beds is not an array:', beds);
          setAvailableBeds([]);
        }
      }

      setFormData(prev => ({
        ...prev,
        changeBedData: {
          ...prev.changeBedData,
          preferred_room_id: roomId,
          preferred_bed_number: undefined
        }
      }));
    } catch (error) {
      console.error('Error loading available beds:', error);
      toast.error('Failed to load available beds');
      if (isMounted.current) {
        setAvailableBeds([]);
      }
    }
  }, []);

  const handleBedSelect = useCallback((bedNumber: number) => {
    setSelectedBedNumber(bedNumber);
    setFormData(prev => ({
      ...prev,
      changeBedData: {
        ...prev.changeBedData,
        preferred_bed_number: bedNumber
      }
    }));
  }, []);

  const handleChangeReasonSelect = useCallback((reasonId: number) => {
    setFormData(prev => ({
      ...prev,
      changeBedData: {
        ...prev.changeBedData,
        change_reason_id: reasonId
      }
    }));
  }, []);

  const handleShiftingDateChange = useCallback((date: string) => {
    setFormData(prev => ({
      ...prev,
      changeBedData: {
        ...prev.changeBedData,
        shifting_date: date
      }
    }));
  }, []);

  const handleNotesChange = useCallback((notes: string) => {
    setFormData(prev => ({
      ...prev,
      changeBedData: {
        ...prev.changeBedData,
        notes
      }
    }));
  }, []);

  // Complaint handlers
  const handleComplaintCategoryChange = useCallback(async (categoryId: number) => {
    setSelectedComplaintCategory(categoryId);
    setComplaintReasons([]);
    setShowCustomReason(false);
    
    setFormData(prev => ({
      ...prev,
      complaintData: {
        ...prev.complaintData,
        category_master_type_id: categoryId,
        reason_master_value_id: undefined,
        custom_reason: undefined
      }
    }));
    
    try {
      const reasons = await getComplaintReasons(categoryId);
      if (isMounted.current) {
        setComplaintReasons(reasons);
      }
    } catch (error) {
      console.error('Error loading complaint reasons:', error);
      toast.error('Failed to load complaint reasons');
    }
  }, []);

  const handleComplaintReasonChange = useCallback((reasonId: number, reasonValue: string) => {
    const isOthers = reasonValue.toLowerCase() === 'others';
    setShowCustomReason(isOthers);
    
    setFormData(prev => ({
      ...prev,
      complaintData: {
        ...prev.complaintData,
        reason_master_value_id: isOthers ? undefined : reasonId,
        custom_reason: isOthers ? prev.complaintData?.custom_reason : undefined
      }
    }));
  }, []);

  const handleCustomReasonChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      complaintData: {
        ...prev.complaintData,
        custom_reason: value || undefined
      }
    }));
  }, []);

  // Vacate data handlers
  const handleVacateDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vacateData: {
        ...prev.vacateData,
        [field]: value
      }
    }));
  }, []);

  // Leave data handlers
  const handleLeaveDataChange = useCallback(
    (field: keyof NonNullable<RequestFormData['leaveData']>, value: any) => {
      setFormData(prev => ({
        ...prev,
        leaveData: {
          ...prev.leaveData,
          [field]: value
        }
      }));
    },
    []
  );

  // Maintenance data handlers
  const handleMaintenanceDataChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      maintenanceData: {
        ...prev.maintenanceData,
        [field]: value
      }
    }));
  }, []);

  // Calculate total days for leave
  const calculateTotalDays = useCallback((startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, []);

  // Submit request
  const handleSubmitRequest = useCallback(async () => {
    try {
      // Basic validation
      if (!formData.title.trim() || !formData.description.trim()) {
        toast.error('Please fill all required fields (Title and Description)');
        return;
      }

      // Additional validation for specific request types
      if (formData.request_type === 'vacate_bed') {
        if (!formData.vacateData?.primary_reason_id) {
          toast.error('Please select a primary reason for vacating');
          return;
        }
        
        if (!formData.vacateData?.expected_vacate_date) {
          toast.error('Please select an expected vacate date');
          return;
        }
      }

      if (formData.request_type === 'leave') {
        if (!formData.leaveData?.leave_start_date) {
          toast.error('Please select a leave start date');
          return;
        }
        
        if (!formData.leaveData?.leave_end_date) {
          toast.error('Please select a leave end date');
          return;
        }
        
        if (!formData.leaveData?.leave_type) {
          toast.error('Please select a leave type');
          return;
        }
        
        const totalDays = calculateTotalDays(
          formData.leaveData.leave_start_date,
          formData.leaveData.leave_end_date
        );
        
        if (totalDays < 1) {
          toast.error('Leave end date must be after start date');
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          leaveData: {
            ...prev.leaveData!,
            total_days: totalDays
          }
        }));
        
        formData.leaveData!.total_days = totalDays;
      }

      if (formData.request_type === 'maintenance') {
        if (!formData.maintenanceData?.issue_category) {
          toast.error('Please select an issue category');
          return;
        }
        
        if (!formData.maintenanceData?.location) {
          toast.error('Please select a location');
          return;
        }
      }

      if (formData.request_type === 'complaint') {
        if (!formData.complaintData?.category_master_type_id) {
          toast.error('Please select a complaint category');
          return;
        }
        
        if (!formData.complaintData?.reason_master_value_id && !formData.complaintData?.custom_reason) {
          toast.error('Please select a reason or provide a custom reason');
          return;
        }
      }

      setSubmitting(true);
      
      const requestData: any = {
        request_type: formData.request_type,
        title: formData.title,
        description: formData.description,
        priority: formData.priority
      };

      // Add specific data based on request type
      if (formData.request_type === 'vacate_bed' && formData.vacateData) {
        requestData.vacate_data = {
          ...formData.vacateData,
          secondary_reasons: secondaryReasonsInput
            .split(',')
            .map(r => r.trim())
            .filter(r => r.length > 0),
          lockin_penalty_accepted: formData.vacateData.agree_lockin_penalty || false,
          notice_penalty_accepted: formData.vacateData.agree_notice_penalty || false,
          expected_vacate_date: formData.vacateData.expected_vacate_date
        };
      }

      if (formData.request_type === 'change_bed' && formData.changeBedData) {
        requestData.change_bed_data = {
          current_property_id: currentRoom?.property_id || 1,
          current_room_id: currentRoom?.room_id || 1,
          current_bed_number: currentRoom?.bed_number || 0,
          preferred_property_id: formData.changeBedData.preferred_property_id,
          preferred_room_id: formData.changeBedData.preferred_room_id,
          change_reason_id: formData.changeBedData.change_reason_id,
          shifting_date: formData.changeBedData.shifting_date,
          notes: formData.changeBedData.notes || '',
          preferred_bed_number: formData.changeBedData.preferred_bed_number
        };
      }

      if (formData.request_type === 'leave' && formData.leaveData) {
        requestData.leave_data = {
          leave_type: formData.leaveData.leave_type,
          leave_start_date: formData.leaveData.leave_start_date,
          leave_end_date: formData.leaveData.leave_end_date,
          total_days: formData.leaveData.total_days || calculateTotalDays(
            formData.leaveData.leave_start_date,
            formData.leaveData.leave_end_date
          ),
          contact_address_during_leave: formData.leaveData.contact_address_during_leave || '',
          emergency_contact_number: formData.leaveData.emergency_contact_number || '',
          room_locked: formData.leaveData.room_locked || false,
          keys_submitted: formData.leaveData.keys_submitted || false
        };
      }

      if (formData.request_type === 'maintenance' && formData.maintenanceData) {
        requestData.maintenance_data = {
          issue_category: formData.maintenanceData.issue_category,
          location: formData.maintenanceData.location,
          preferred_visit_time: formData.maintenanceData.preferred_visit_time || 'anytime',
          access_permission: formData.maintenanceData.access_permission || false,
        };
      }

      if (formData.request_type === 'complaint' && formData.complaintData) {
        requestData.complaint_data = {
          category_master_type_id: formData.complaintData.category_master_type_id,
          reason_master_value_id: formData.complaintData.reason_master_value_id,
          custom_reason: formData.complaintData.custom_reason || null
        };
      }

      
      const result = await createTenantRequest(requestData);
      
      if (result && isMounted.current) {
        toast.success('Request created successfully!');
        setIsDialogOpen(false);
        
        // Reset form
        setFormData({
          request_type: 'general',
          title: '',
          description: '',
          priority: 'medium'
        });
        setSecondaryReasonsInput('');
        setStep(1);
        setSelectedPropertyId(null);
        setAvailableRooms([]);
        setSelectedRoomId(null);
        setAvailableBeds([]);
        setSelectedBedNumber(null);
        setSelectedComplaintCategory(null);
        setComplaintReasons([]);
        setShowCustomReason(false);
        
        // Refresh data
        await refreshData();
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      if (isMounted.current) {
        toast.error(error.message || 'Failed to create request');
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  }, [formData, currentRoom, secondaryReasonsInput, calculateTotalDays, refreshData]);

  // Loading state
  if (loading && !initialLoadComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading your requests...</p>
      </div>
    );
  }

  return (
    <div>
      {/* <TenantHeader /> */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* <Button variant="outline" onClick={() => router.push('/tenant/portal')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button> */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
                <p className="text-gray-600 mt-1">Raise requests and track their status</p>
              </div>
            </div>

            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>

          {/* Quick Request Cards */}
          <QuickRequestCards onQuickRequest={handleQuickRequest} />

          {/* Request List */}
          <Card>
            <CardHeader>
              <CardTitle>Request History</CardTitle>
              <CardDescription>
                View and track all your requests. Total: {requests.length} requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                <RequestFilters 
                  filter={activeFilter} 
                  onFilterChange={setActiveFilter}
                  counts={requestCounts}
                />

                <TabsContent value={activeFilter} className="mt-6">
                  {filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                      <p className="text-gray-600 mb-6">
                        {activeFilter === 'all' 
                          ? "You haven't created any requests yet." 
                          : `You have no ${activeFilter.replace('_', ' ')} requests.`}
                      </p>
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRequests.map((request) => (
                        <RequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Request Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Reset form when dialog closes
          setFormData({
            request_type: 'general',
            title: '',
            description: '',
            priority: 'medium'
          });
          setSecondaryReasonsInput('');
          setStep(1);
          setSelectedPropertyId(null);
          setAvailableRooms([]);
          setSelectedRoomId(null);
          setAvailableBeds([]);
          setSelectedBedNumber(null);
          setSelectedComplaintCategory(null);
          setComplaintReasons([]);
          setShowCustomReason(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Request</DialogTitle>
            <DialogDescription>
              Fill in the details below to submit your request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="request_type">Request Type *</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value) => {
                  setFormData({ 
                    ...formData, 
                    request_type: value,
                    vacateData: value === 'vacate_bed' ? formData.vacateData : undefined,
                    changeBedData: value === 'change_bed' ? formData.changeBedData : undefined,
                    leaveData: value === 'leave' ? formData.leaveData : undefined,
                    maintenanceData: value === 'maintenance' ? formData.maintenanceData : undefined,
                    complaintData: value === 'complaint' ? formData.complaintData : undefined
                  });
                  if (value === 'change_bed') {
                    setStep(1);
                  }
                  if (value === 'complaint') {
                    setSelectedComplaintCategory(null);
                    setComplaintReasons([]);
                    setShowCustomReason(false);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Query</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="receipt">Receipt Request</SelectItem>
                  <SelectItem value="maintenance">Maintenance Request</SelectItem>
                  <SelectItem value="leave">Leave Application</SelectItem>
                  <SelectItem value="vacate_bed">Vacate Bed Request</SelectItem>
                  <SelectItem value="change_bed">Change Bed Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title for your request"
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your request"
                rows={3}
              />
            </div>

            {/* Conditional rendering for Change Bed Request */}
            {formData.request_type === 'change_bed' && (
              <ChangeBedForm
                step={step}
                setStep={setStep}
                currentRoom={currentRoom}
                changeReasons={changeReasons}
                properties={properties}
                selectedPropertyId={selectedPropertyId}
                setSelectedPropertyId={setSelectedPropertyId}
                availableRooms={availableRooms}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
                availableBeds={availableBeds}
                selectedBedNumber={selectedBedNumber}
                setSelectedBedNumber={setSelectedBedNumber}
                onPropertySelect={handlePropertySelect}
                onRoomSelect={handleRoomSelect}
                onBedSelect={handleBedSelect}
                onReasonSelect={handleChangeReasonSelect}
                onDateChange={handleShiftingDateChange}
                onNotesChange={handleNotesChange}
                formData={formData}
              />
            )}

            {/* Conditional rendering for Vacate Bed Request */}
            {formData.request_type === 'vacate_bed' && (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg">Vacate Bed Details</h3>
                
                {/* Lock-in Period Information */}
                {lockinInfo && (
                  <div className={`rounded-lg p-4 ${lockinInfo.isInLockinPeriod ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-start gap-3">
                      {lockinInfo.isInLockinPeriod ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <Check className="h-5 w-5 text-green-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {lockinInfo.isInLockinPeriod ? 'Lock-in Period Active' : 'Lock-in Period Completed'}
                        </h4>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm">
                            Check-in Date: {format(new Date(lockinInfo.checkInDate), 'dd MMM yyyy')}
                          </p>
                          <p className="text-sm">
                            Lock-in Period: {lockinInfo.lockinPeriodMonths} months
                          </p>
                          <p className="text-sm">
                            Lock-in Ends: {format(new Date(lockinInfo.lockinEnds), 'dd MMM yyyy')}
                          </p>
                          {lockinInfo.isInLockinPeriod && (
                            <>
                              <p className="text-sm">
                                Remaining: {lockinInfo.remainingMonths} month{lockinInfo.remainingMonths > 1 ? 's' : ''}
                              </p>
                              <p className="text-sm font-medium">
                                Early Vacate Penalty: {lockinInfo.penalty.description}
                              </p>
                              {lockinInfo.penalty.calculatedAmount && (
                                <p className="text-sm font-bold">
                                  Amount Payable: ₹{lockinInfo.penalty.calculatedAmount.toFixed(2)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        
                        {lockinInfo.isInLockinPeriod && (
                          <div className="flex items-start space-x-2 mt-3">
                            <Checkbox
                              id="agree_lockin_penalty"
                              checked={formData.vacateData?.agree_lockin_penalty || false}
                              onCheckedChange={(checked) => 
                                handleVacateDataChange('agree_lockin_penalty', checked)
                              }
                            />
                            <Label htmlFor="agree_lockin_penalty" className="text-sm cursor-pointer">
                              I understand and agree to pay the lock-in period penalty
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notice Period Information */}
                {noticeInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-800">Notice Period Requirements</h4>
                        <div className="space-y-1 mt-2">
                          <p className="text-sm text-blue-700">
                            Required Notice: {noticeInfo.noticePeriodDays} days
                          </p>
                          {noticeInfo.penalty.amount && (
                            <>
                              <p className="text-sm text-blue-700 font-medium">
                                Notice Period Penalty: {noticeInfo.penalty.description}
                              </p>
                              {noticeInfo.penalty.calculatedAmount && (
                                <p className="text-sm text-blue-700 font-bold">
                                  Amount Payable: ₹{noticeInfo.penalty.calculatedAmount.toFixed(2)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        
                        {noticeInfo.requiresAgreement && (
                          <div className="flex items-start space-x-2 mt-3">
                            <Checkbox
                              id="agree_notice_penalty"
                              checked={formData.vacateData?.agree_notice_penalty || false}
                              onCheckedChange={(checked) => 
                                handleVacateDataChange('agree_notice_penalty', checked)
                              }
                            />
                            <Label htmlFor="agree_notice_penalty" className="text-sm text-blue-800 cursor-pointer">
                              I understand and agree to the notice period requirements
                            </Label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show message if no lock-in/notice info found */}
                {(!lockinInfo || !noticeInfo) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">
                          {loading ? 'Loading contract details...' : 'Contract details not available'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          You can still submit your request without penalty information
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expected Vacate Date */}
                <div>
                  <Label htmlFor="expected_vacate_date">Expected Vacate Date *</Label>
                  <Input
                    id="expected_vacate_date"
                    type="date"
                    value={formData.vacateData?.expected_vacate_date || ''}
                    onChange={(e) => handleVacateDataChange('expected_vacate_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select when you plan to vacate
                  </p>
                </div>

                <div>
                  <Label htmlFor="primary_reason">Primary Reason for Vacating *</Label>
                  <Select
                    value={formData.vacateData?.primary_reason_id?.toString() || ''}
                    onValueChange={(value) => handleVacateDataChange('primary_reason_id', parseInt(value))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select primary reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(vacateReasons) && vacateReasons.map((reason) => (
                        <SelectItem key={reason.id} value={reason.id.toString()}>
                          {reason.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="secondary_reasons">
                    Secondary Reasons (comma separated)
                  </Label>
                  <Input
                    id="secondary_reasons"
                    value={secondaryReasonsInput}
                    onChange={(e) => setSecondaryReasonsInput(e.target.value)}
                    placeholder="e.g., Distance from work, Need bigger room, etc."
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter multiple reasons separated by commas
                  </p>
                </div>

                {/* Ratings Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overall_rating">Overall Rating (1-5)</Label>
                    <Select
                      value={formData.vacateData?.overall_rating?.toString() || ''}
                      onValueChange={(value) => handleVacateDataChange('overall_rating', parseInt(value))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="food_rating">Food Rating (1-5)</Label>
                    <Select
                      value={formData.vacateData?.food_rating?.toString() || ''}
                      onValueChange={(value) => handleVacateDataChange('food_rating', parseInt(value))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cleanliness_rating">Cleanliness Rating (1-5)</Label>
                    <Select
                      value={formData.vacateData?.cleanliness_rating?.toString() || ''}
                      onValueChange={(value) => handleVacateDataChange('cleanliness_rating', parseInt(value))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="management_rating">Management Rating (1-5)</Label>
                    <Select
                      value={formData.vacateData?.management_rating?.toString() || ''}
                      onValueChange={(value) => handleVacateDataChange('management_rating', parseInt(value))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Poor</SelectItem>
                        <SelectItem value="2">2 - Poor</SelectItem>
                        <SelectItem value="3">3 - Average</SelectItem>
                        <SelectItem value="4">4 - Good</SelectItem>
                        <SelectItem value="5">5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="improvement_suggestions">Improvement Suggestions</Label>
                  <Textarea
                    id="improvement_suggestions"
                    value={formData.vacateData?.improvement_suggestions || ''}
                    onChange={(e) => handleVacateDataChange('improvement_suggestions', e.target.value)}
                    placeholder="Any suggestions for improvement..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Conditional rendering for Leave Request */}
            {formData.request_type === 'leave' && (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg">Leave Application Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leave_type">Leave Type *</Label>
                    <Select
                      value={formData.leaveData?.leave_type || ''}
                      onValueChange={(value) => handleLeaveDataChange('leave_type', value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map((type) => (
                          <SelectItem key={type.id} value={type.value}>
                            <div className="flex flex-col">
                              <span className="font-medium">{type.value}</span>
                              {type.description && (
                                <span className="text-xs text-gray-500">{type.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="total_days">Total Days *</Label>
                    <Input
                      id="total_days"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.leaveData?.total_days || ''}
                      onChange={(e) => handleLeaveDataChange('total_days', parseInt(e.target.value) || 0)}
                      placeholder="Enter number of days"
                      className="h-12"
                      disabled={!!(formData.leaveData?.leave_start_date && formData.leaveData?.leave_end_date)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be auto-calculated from dates, maximum 30 days allowed
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leave_start_date">Leave Start Date *</Label>
                    <Input
                      id="leave_start_date"
                      type="date"
                      value={formData.leaveData?.leave_start_date || ''}
                      onChange={(e) => {
                        handleLeaveDataChange('leave_start_date', e.target.value);
                        if (formData.leaveData?.leave_end_date && e.target.value) {
                          const totalDays = calculateTotalDays(e.target.value, formData.leaveData.leave_end_date);
                          handleLeaveDataChange('total_days', totalDays);
                        }
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="leave_end_date">Leave End Date *</Label>
                    <Input
                      id="leave_end_date"
                      type="date"
                      value={formData.leaveData?.leave_end_date || ''}
                      onChange={(e) => {
                        handleLeaveDataChange('leave_end_date', e.target.value);
                        if (formData.leaveData?.leave_start_date && e.target.value) {
                          const totalDays = calculateTotalDays(formData.leaveData.leave_start_date, e.target.value);
                          handleLeaveDataChange('total_days', totalDays);
                        }
                      }}
                      min={formData.leaveData?.leave_start_date || new Date().toISOString().split('T')[0]}
                      className="h-12"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contact_address_during_leave">Contact Address During Leave</Label>
                  <Textarea
                    id="contact_address_during_leave"
                    value={formData.leaveData?.contact_address_during_leave || ''}
                    onChange={(e) => handleLeaveDataChange('contact_address_during_leave', e.target.value)}
                    placeholder="Your address during the leave period"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                  <Input
                    id="emergency_contact_number"
                    type="tel"
                    value={formData.leaveData?.emergency_contact_number || ''}
                    onChange={(e) => handleLeaveDataChange('emergency_contact_number', e.target.value)}
                    placeholder="Emergency contact number"
                    className="h-12"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="room_locked"
                      checked={formData.leaveData?.room_locked || false}
                      onCheckedChange={(checked) => handleLeaveDataChange('room_locked', checked)}
                    />
                    <Label htmlFor="room_locked" className="cursor-pointer">Room will be locked during leave</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="keys_submitted"
                      checked={formData.leaveData?.keys_submitted || false}
                      onCheckedChange={(checked) => handleLeaveDataChange('keys_submitted', checked)}
                    />
                    <Label htmlFor="keys_submitted" className="cursor-pointer">Keys will be submitted before leave</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Conditional rendering for Maintenance Request */}
            {formData.request_type === 'maintenance' && (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg">Maintenance Request Details</h3>
                
                <div>
                  <Label htmlFor="issue_category">Issue Category *</Label>
                  <Select
                    value={formData.maintenanceData?.issue_category || ''}
                    onValueChange={(value) => handleMaintenanceDataChange('issue_category', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.maintenanceData?.location || ''}
                    onValueChange={(value) => handleMaintenanceDataChange('location', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_LOCATIONS.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferred_visit_time">Preferred Visit Time</Label>
                  <Select
                    value={formData.maintenanceData?.preferred_visit_time || ''}
                    onValueChange={(value) => handleMaintenanceDataChange('preferred_visit_time', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISIT_TIMES.map((time) => (
                        <SelectItem key={time.id} value={time.id}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="access_permission"
                    checked={formData.maintenanceData?.access_permission || false}
                    onCheckedChange={(checked) => handleMaintenanceDataChange('access_permission', checked)}
                  />
                  <Label htmlFor="access_permission" className="cursor-pointer">
                    I grant permission for staff to enter my room when I'm away if needed
                  </Label>
                </div>
              </div>
            )}

            {/* Conditional rendering for Complaint Request */}
            {formData.request_type === 'complaint' && (
              <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-semibold text-lg text-red-800">Complaint Details</h3>
                
                <div>
                  <Label htmlFor="complaint_category" className="text-base">Complaint Category *</Label>
                  <Select
                    value={formData.complaintData?.category_master_type_id?.toString() || ''}
                    onValueChange={(value) => handleComplaintCategoryChange(parseInt(value))}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select complaint category" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.name}</span>
                            {category.description && (
                              <span className="text-xs text-gray-500">{category.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedComplaintCategory && complaintReasons.length > 0 && (
                  <div>
                    <Label htmlFor="complaint_reason" className="text-base">Select Reason *</Label>
                    <Select
                      value={formData.complaintData?.reason_master_value_id?.toString() || ''}
                      onValueChange={(value) => {
                        const reason = complaintReasons.find(r => r.id.toString() === value);
                        handleComplaintReasonChange(parseInt(value), reason?.value || '');
                      }}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select reason for complaint" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintReasons.map((reason) => (
                          <SelectItem key={reason.id} value={reason.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{reason.value}</span>
                              {reason.description && (
                                <span className="text-xs text-gray-500">{reason.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showCustomReason && (
                  <div>
                    <Label htmlFor="custom_reason" className="text-base">Please specify your reason *</Label>
                    <Textarea
                      id="custom_reason"
                      value={formData.complaintData?.custom_reason || ''}
                      onChange={(e) => handleCustomReasonChange(e.target.value)}
                      placeholder="Please describe your complaint in detail..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRequest}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}