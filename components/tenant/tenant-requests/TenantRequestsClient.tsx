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
import { ArrowLeft, FileText, Plus, Loader2, Send, AlertTriangle, Check, Info, Home, X } from 'lucide-react';
import { format } from 'date-fns';

// Import extracted components
import { QuickRequestCards } from './QuickRequestCards';
import { RequestFilters } from './RequestFilters';
import { RequestCard } from './RequestCard';
import { ChangeBedForm } from './ChangeBedForm';
import { QUICK_REQUESTS, type RequestFormData } from './requestConfig';

// Import API functions
import {
  createTenantRequest,
  getMyTenantRequests,
  getTenantContractDetails,
  getCurrentRoomInfo,
  getActiveProperties,
  getChangeBedReasonsFromMasters as getChangeBedReasons,
  getAvailableRooms,
  getAvailableBedsForRoom,
  getLeaveTypesFromMasters,
  getComplaintCategoriesFromMasters as getComplaintCategories,
  getComplaintReasonsFromMasters as getComplaintReasons,
   getMaintenanceCategoriesFromMasters,
  getMaintenanceLocationsFromMasters,
  getVisitTimesFromMasters,
  type TenantRequest,
  type Property as ApiProperty,
  type Room as ApiRoom,
  type ChangeReason,
  type CurrentRoomInfo,
  type ComplaintCategory,
  type ComplaintReason,
  type LeaveType,
  getVacateReasonsFromMasters,
} from "@/lib/tenantRequestsApi";

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
  // Add these state declarations with your other state
const [maintenanceCategories, setMaintenanceCategories] = useState<any[]>([]);
const [maintenanceLocations, setMaintenanceLocations] = useState<any[]>([]);
const [visitTimes, setVisitTimes] = useState<any[]>([]);
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
      // Make sure this function is imported
      // In the Promise.allSettled array, replace the getActiveMasterValuesByCode line with:
  getVacateReasonsFromMasters().catch(err => {
  console.error('Failed to fetch vacate reasons:', err);
  return [];
  }),
      getLeaveTypesFromMasters().catch(err => {
        console.error('Failed to fetch leave types:', err);
        return [];
      }),
      getComplaintCategories().catch(err => {
        console.error('Failed to fetch complaint categories:', err);
        return [];
      }),
      // Get maintenance categories from Requests tab
      getMaintenanceCategoriesFromMasters().catch(err => {
        console.error('Failed to fetch maintenance categories:', err);
        return [];
      }),
      // Get maintenance locations from Requests tab
      getMaintenanceLocationsFromMasters().catch(err => {
        console.error('Failed to fetch maintenance locations:', err);
        return [];
      }),
      // Get visit times from Requests tab
      getVisitTimesFromMasters().catch(err => {
        console.error('Failed to fetch visit times:', err);
        return [];
      })
    ]);

    // Only update state if component is still mounted
    if (!isMounted.current) return;

    // Handle requests data
    if (results[0].status === 'fulfilled') {
      setRequests(results[0].value);
    }

    // Handle contract data - FIXED VERSION
    if (results[1].status === 'fulfilled') {
      const contractResponse:any = results[1].value;
      console.log('📋 Contract response received:', contractResponse);
      
      // Check if the response has the expected structure
      if (contractResponse && contractResponse.success && contractResponse.data) {
        // Extract the nested data
        const { lockinInfo, noticeInfo } = contractResponse.data;
        console.log('🔒 Setting lockinInfo:', lockinInfo);
        console.log('📋 Setting noticeInfo:', noticeInfo);
        
        setLockinInfo(lockinInfo || null);
        setNoticeInfo(noticeInfo || null);
      } 
      // If the API function already returns just the data
      else if (contractResponse && contractResponse.lockinInfo) {
        setLockinInfo(contractResponse.lockinInfo || null);
        setNoticeInfo(contractResponse.noticeInfo || null);
      }
      else {
        console.warn('⚠️ Unexpected contract response structure:', contractResponse);
        setLockinInfo(null);
        setNoticeInfo(null);
      }
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

    // Handle vacate reasons - FIXED VERSION
    if (results[5].status === 'fulfilled') {
      const response:any = results[5].value;
      console.log('📋 Vacate reasons response:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setVacateReasons(response.data);
      } else if (Array.isArray(response)) {
        setVacateReasons(response);
      } else {
        setVacateReasons([]);
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

    // Handle maintenance categories
    if (results[8].status === 'fulfilled') {
      const maintenanceCategoriesData = results[8].value;
      console.log('📋 Maintenance categories from Requests tab:', maintenanceCategoriesData);
      if (Array.isArray(maintenanceCategoriesData)) {
        setMaintenanceCategories(maintenanceCategoriesData);
      }
    }

    // Handle maintenance locations
    if (results[9].status === 'fulfilled') {
      const maintenanceLocationsData = results[9].value;
      console.log('📋 Maintenance locations from Requests tab:', maintenanceLocationsData);
      if (Array.isArray(maintenanceLocationsData)) {
        setMaintenanceLocations(maintenanceLocationsData);
      }
    }

    // Handle visit times
    if (results[10].status === 'fulfilled') {
      const visitTimesData = results[10].value;
      console.log('📋 Visit times from Requests tab:', visitTimesData);
      if (Array.isArray(visitTimesData)) {
        setVisitTimes(visitTimesData);
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
       console.log('API Response:', result);

        
    
      
      if (result && result.success && isMounted.current) {
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
      }else {
        toast.error('Failed to create request. Please try again.');
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
        <div className="mb-4 sm:mb-6">

  {/* Top Row: Title + Button */}
  <div className="flex items-center justify-between">
    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
      My Requests
    </h1>

    <Button 
      onClick={() => setIsDialogOpen(true)} 
      className="bg-blue-600 hover:bg-blue-700 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
    >
      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
      New Request
    </Button>
  </div>

  {/* Subtitle */}
  <p className="text-xs sm:text-sm text-gray-600 mt-1">
    Raise requests and track their status
  </p>

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
        <DialogContent className="max-w-3xl w-[98vw] p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 sticky top-0 z-10">
  <DialogTitle className="text-white text-lg">Create New Request</DialogTitle>
  <DialogDescription className="text-blue-50 text-sm">
    Fill in the details below to submit your request
  </DialogDescription>
  {/* Close button in header */}
  <button
    onClick={() => setIsDialogOpen(false)}
    className="absolute right-4 top-4 rounded-sm opacity-70  transition-opacity hover:opacity-100  disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
  >
    <X className="h-4 w-4 text-white" />
    <span className="sr-only">Close</span>
  </button>
</DialogHeader>

          <div className="px-4 py-3 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="space-y-4">
              {/* Request Type and Priority in grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="request_type" className="text-sm font-medium">Request Type *</Label>
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
                    <SelectTrigger className="h-10">
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

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger className="h-10">
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
              </div>

              {/* Title and Description */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief title for your request"
                    className="h-10"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed information about your request"
                    className="h-10"
                  />
                </div>
              </div>

              {/* Conditional rendering for Change Bed Request */}
              {formData.request_type === 'change_bed' && (
                <div className="border-t border-gray-200 pt-3">
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
                </div>
              )}

              {/* Conditional rendering for Vacate Bed Request */}
              {formData.request_type === 'vacate_bed' && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  <h3 className="font-semibold text-base">Vacate Bed Details</h3>
                  
                  {/* Lock-in Period Information */}
                  {lockinInfo && (
                    <div className={`rounded-lg p-2 ${lockinInfo.isInLockinPeriod ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                      <div className="flex items-start gap-2">
                        {lockinInfo.isInLockinPeriod ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">
                            {lockinInfo.isInLockinPeriod ? 'Lock-in Period Active' : 'Lock-in Period Completed'}
                          </h4>
                          <div className="grid grid-cols-4 gap-2 mt-1 text-sm">
                            <p>Check-in: {format(new Date(lockinInfo.checkInDate), 'dd MMM yyyy')}</p>
                            <p>Lock-in: {lockinInfo.lockinPeriodMonths} months</p>
                            <p>Ends: {format(new Date(lockinInfo.lockinEnds), 'dd MMM yyyy')}</p>
                            {lockinInfo.isInLockinPeriod && lockinInfo.penalty.calculatedAmount && (
                              <p className="font-bold">Payable: ₹{lockinInfo.penalty.calculatedAmount.toFixed(2)}</p>
                            )}
                          </div>
                          
                          {lockinInfo.isInLockinPeriod && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Checkbox
                                id="agree_lockin_penalty"
                                checked={formData.vacateData?.agree_lockin_penalty || false}
                                onCheckedChange={(checked) => 
                                  handleVacateDataChange('agree_lockin_penalty', checked)
                                }
                              />
                              <Label htmlFor="agree_lockin_penalty" className="text-sm cursor-pointer">
                                I agree to pay the lock-in penalty
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notice Period Information */}
                  {noticeInfo && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-blue-800">Notice Period</h4>
                          <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-blue-700">
                            <p>Required: {noticeInfo.noticePeriodDays} days</p>
                            {noticeInfo.penalty.calculatedAmount && (
                              <p className="font-bold">Payable: ₹{noticeInfo.penalty.calculatedAmount.toFixed(2)}</p>
                            )}
                          </div>
                          
                          {noticeInfo.requiresAgreement && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Checkbox
                                id="agree_notice_penalty"
                                checked={formData.vacateData?.agree_notice_penalty || false}
                                onCheckedChange={(checked) => 
                                  handleVacateDataChange('agree_notice_penalty', checked)
                                }
                              />
                              <Label htmlFor="agree_notice_penalty" className="text-sm text-blue-800 cursor-pointer">
                                I agree to notice period requirements
                              </Label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show message if no lock-in/notice info found */}
                  {(!lockinInfo || !noticeInfo) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-gray-600">
                            {loading ? 'Loading contract details...' : 'Contract details not available'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vacate Fields Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="expected_vacate_date" className="text-sm font-medium">Vacate Date *</Label>
                      <Input
                        id="expected_vacate_date"
                        type="date"
                        value={formData.vacateData?.expected_vacate_date || ''}
                        onChange={(e) => handleVacateDataChange('expected_vacate_date', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="primary_reason" className="text-sm font-medium">Primary Reason *</Label>
                      <Select
                        value={formData.vacateData?.primary_reason_id?.toString() || ''}
                        onValueChange={(value) => handleVacateDataChange('primary_reason_id', parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
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

                    <div className="space-y-1">
                      <Label htmlFor="secondary_reasons" className="text-sm font-medium">Secondary</Label>
                      <Input
                        id="secondary_reasons"
                        value={secondaryReasonsInput}
                        onChange={(e) => setSecondaryReasonsInput(e.target.value)}
                        placeholder="Comma separated"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {/* Ratings Section */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label className="text-sm">Overall Rating</Label>
                      <Select
                        value={formData.vacateData?.overall_rating?.toString() || ''}
                        onValueChange={(value) => handleVacateDataChange('overall_rating', parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Rating" />
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

                    <div className="space-y-1">
                      <Label className="text-sm">Food</Label>
                      <Select
                        value={formData.vacateData?.food_rating?.toString() || ''}
                        onValueChange={(value) => handleVacateDataChange('food_rating', parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Rating" />
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

                    <div className="space-y-1">
                      <Label className="text-sm">Cleanliness</Label>
                      <Select
                        value={formData.vacateData?.cleanliness_rating?.toString() || ''}
                        onValueChange={(value) => handleVacateDataChange('cleanliness_rating', parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Rating" />
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

                    <div className="space-y-1">
                      <Label className="text-sm">Management</Label>
                      <Select
                        value={formData.vacateData?.management_rating?.toString() || ''}
                        onValueChange={(value) => handleVacateDataChange('management_rating', parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select Rating" />
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

                  {/* Improvement Suggestions */}
                  <Input
                    id="improvement_suggestions"
                    value={formData.vacateData?.improvement_suggestions || ''}
                    onChange={(e) => handleVacateDataChange('improvement_suggestions', e.target.value)}
                    placeholder="Improvement suggestions"
                    className="h-10"
                  />
                </div>
              )}

              {/* Conditional rendering for Leave Request */}
              {formData.request_type === 'leave' && (
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  <h3 className="font-semibold text-base">Leave Application Details</h3>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="leave_type" className="text-sm font-medium">Leave Type *</Label>
                      <Select
                        value={formData.leaveData?.leave_type || ''}
                        onValueChange={(value) => handleLeaveDataChange('leave_type', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          {leaveTypes.map((type) => (
                            <SelectItem key={type.id} value={type.value}>
                              {type.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="total_days" className="text-sm font-medium">Days *</Label>
                      <Input
                        id="total_days"
                        type="number"
                        min="1"
                        max="30"
                        value={formData.leaveData?.total_days || ''}
                        onChange={(e) => handleLeaveDataChange('total_days', parseInt(e.target.value) || 0)}
                        placeholder="Days"
                        className="h-10"
                        disabled={!!(formData.leaveData?.leave_start_date && formData.leaveData?.leave_end_date)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="emergency_contact_number" className="text-sm font-medium">Emergency</Label>
                      <Input
                        id="emergency_contact_number"
                        type="tel"
                        value={formData.leaveData?.emergency_contact_number || ''}
                        onChange={(e) => handleLeaveDataChange('emergency_contact_number', e.target.value)}
                        placeholder="Contact"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="leave_start_date" className="text-sm font-medium">Start Date *</Label>
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
                        className="h-10"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="leave_end_date" className="text-sm font-medium">End Date *</Label>
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
                        className="h-10"
                      />
                    </div>
                  </div>

                  <Input
                    value={formData.leaveData?.contact_address_during_leave || ''}
                    onChange={(e) => handleLeaveDataChange('contact_address_during_leave', e.target.value)}
                    placeholder="Contact address during leave"
                    className="h-10"
                  />

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="room_locked"
                        checked={formData.leaveData?.room_locked || false}
                        onCheckedChange={(checked) => handleLeaveDataChange('room_locked', checked)}
                      />
                      <Label htmlFor="room_locked" className="text-sm cursor-pointer">Room will be locked during leave</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keys_submitted"
                        checked={formData.leaveData?.keys_submitted || false}
                        onCheckedChange={(checked) => handleLeaveDataChange('keys_submitted', checked)}
                      />
                      <Label htmlFor="keys_submitted" className="text-sm cursor-pointer">Keys will be submitted before leave</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional rendering for Maintenance Request */}
              {/* Conditional rendering for Maintenance Request - UPDATED with masters */}
{formData.request_type === 'maintenance' && (
  <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
    <h3 className="font-semibold text-lg">Maintenance Request Details</h3>
    
    <div>
      <Label htmlFor="issue_category">Issue Category *</Label>
      <Select
        value={formData.maintenanceData?.issue_category || ''}
        onValueChange={(value) => handleMaintenanceDataChange('issue_category', value)}
        disabled={maintenanceCategories.length === 0}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder={maintenanceCategories.length === 0 ? "Loading categories..." : "Select issue category"} />
        </SelectTrigger>
        <SelectContent>
          {maintenanceCategories.length > 0 ? (
            maintenanceCategories.map((category) => (
              <SelectItem key={category.id} value={category.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{category.value}</span>
                  {category.description && (
                    <span className="text-xs text-gray-500">{category.description}</span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              <span className="text-xs">Loading categories...</span>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="location">Location *</Label>
      <Select
        value={formData.maintenanceData?.location || ''}
        onValueChange={(value) => handleMaintenanceDataChange('location', value)}
        disabled={maintenanceLocations.length === 0}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder={maintenanceLocations.length === 0 ? "Loading locations..." : "Select location"} />
        </SelectTrigger>
        <SelectContent>
          {maintenanceLocations.length > 0 ? (
            maintenanceLocations.map((location) => (
              <SelectItem key={location.id} value={location.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{location.value}</span>
                  {location.description && (
                    <span className="text-xs text-gray-500">{location.description}</span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              <span className="text-xs">Loading locations...</span>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label htmlFor="preferred_visit_time">Preferred Visit Time</Label>
      <Select
        value={formData.maintenanceData?.preferred_visit_time || ''}
        onValueChange={(value) => handleMaintenanceDataChange('preferred_visit_time', value)}
        disabled={visitTimes.length === 0}
      >
        <SelectTrigger className="h-12">
          <SelectValue placeholder={visitTimes.length === 0 ? "Loading visit times..." : "Select preferred time"} />
        </SelectTrigger>
        <SelectContent>
          {visitTimes.length > 0 ? (
            visitTimes.map((time) => (
              <SelectItem key={time.id} value={time.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{time.value}</span>
                  {time.description && (
                    <span className="text-xs text-gray-500">{time.description}</span>
                  )}
                </div>
              </SelectItem>
            ))
          ) : (
            <div className="px-2 py-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              <span className="text-xs">Loading visit times...</span>
            </div>
          )}
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
                <div className="border-t border-red-200 pt-3 space-y-3">
                  <h3 className="font-semibold text-base text-red-800">Complaint Details</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="complaint_category" className="text-sm font-medium">Category *</Label>
                      <Select
                        value={formData.complaintData?.category_master_type_id?.toString() || ''}
                        onValueChange={(value) => handleComplaintCategoryChange(parseInt(value))}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {complaintCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedComplaintCategory && complaintReasons.length > 0 && (
                      <div className="space-y-1">
                        <Label htmlFor="complaint_reason" className="text-sm font-medium">Reason *</Label>
                        <Select
                          value={formData.complaintData?.reason_master_value_id?.toString() || ''}
                          onValueChange={(value) => {
                            const reason = complaintReasons.find(r => r.id.toString() === value);
                            handleComplaintReasonChange(parseInt(value), reason?.value || '');
                          }}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            {complaintReasons.map((reason) => (
                              <SelectItem key={reason.id} value={reason.id.toString()}>
                                {reason.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {showCustomReason && (
                    <Input
                      value={formData.complaintData?.custom_reason || ''}
                      onChange={(e) => handleCustomReasonChange(e.target.value)}
                      placeholder="Describe your complaint"
                      className="h-10"
                    />
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
                className="flex-1 h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-10"
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
                    Submit
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}