"use client";

import { useState, useCallback, useEffect, memo } from 'react';
import {
  X, User, Phone, Mail, Users, Calendar, CreditCard, FileText,
  Check, CalendarDays, IndianRupee, Shield,
  Smartphone, Wallet, Building2, Lock, DoorOpen, BedDouble,
  Home, Grid, ChevronRight, MapPin, Hash, Layers, UserCircle,
  AlertCircle, CheckCircle, XCircle
} from 'lucide-react';

// Room API import
import { listRoomsByProperty } from "@/lib/roomsApi";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  setBookingType: (type: string) => void;
  propertyData: any;
  preselectedRoomId?: number;
  onBookingSuccess?: (bookingData: any) => void;
}

interface Room {
  id: number;
  room_number: string;
  room_type: string;
  sharing_type: string;
  monthly_rent: number;
  daily_rate: number;
  is_available: boolean;
  floor: string;
  total_beds: number;
  available_beds: number;
  amenities?: string[];
  gender_preference?: string[];
}

interface BookingData {
  salutation: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  moveInDate: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: string;
  roomNumber: string;
  sharingType: string;
  monthlyRent: number;
  dailyRate: number;
  floor: string;
  bookingType: string;
  propertyId: number;
  propertyName: string;
  paymentMethod: string;
  couponCode: string;
  totalAmount: number;
  rentAmount: number;
  securityDeposit: number;
  verificationStatus: boolean;
  bookingStatus: string;
  paymentStatus: string;
}

// Confirmation Modal Component
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  bookingDetails 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  message: string; 
  bookingDetails?: any;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 text-center mb-4">
          {message}
        </p>

        {bookingDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold text-gray-900">#{bookingDetails.id}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Room:</span>
              <span className="font-semibold text-gray-900">{bookingDetails.roomNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-green-600">₹{bookingDetails.totalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900 capitalize">{bookingDetails.paymentMethod}</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Adv.', 'Er.', 'Miss'];

const BookingModal = memo(function BookingModal({ 
  isOpen, 
  onClose, 
  bookingType, 
  setBookingType,
  propertyData,
  preselectedRoomId,
  onBookingSuccess 
}: BookingModalProps) {
  const [bookingStep, setBookingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'inperson'>('inperson');
  const [phoneError, setPhoneError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verified, setVerified] = useState(false);
  
  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    moveInDate: '',
    checkInDate: '',
    checkOutDate: '',
    guests: "1",
    sharingType: '',
    roomId: '',
    roomNumber: '',
    monthlyRent: 0,
    dailyRate: 0,
    floor: '',
    couponCode: '',
    agreeToTerms: false
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBookingStep(1);
      setSelectedRoom(null);
      setRooms([]);
      setRoomsError('');
      setVerificationCode(['', '', '', '', '', '']);
      setVerificationSent(false);
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      
      if (propertyData?.id) {
        fetchRooms();
      }
    } else {
      // Reset all state when modal closes
      setBookingStep(1);
      setSelectedRoom(null);
      setRooms([]);
      setRoomsError('');
      setVerificationCode(['', '', '', '', '', '']);
      setVerificationSent(false);
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      setFormData({
        salutation: 'Mr.',
        fullName: '', 
        email: '', 
        phone: '', 
        gender: '', 
        moveInDate: '',
        checkInDate: '', 
        checkOutDate: '', 
        guests: "1",
        sharingType: '', 
        roomId: '', 
        roomNumber: '',
        monthlyRent: 0,
        dailyRate: 0,
        floor: '',
        couponCode: '', 
        agreeToTerms: false
      });
    }
  }, [isOpen, propertyData?.id]);

  // Auto-select room when preselectedRoomId is provided
  useEffect(() => {
    if (preselectedRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === preselectedRoomId);
      if (room) {
        // Small delay to ensure room selection works
        setTimeout(() => {
          handleRoomSelect(room);
          console.log('✅ Auto-selected room:', room.room_number);
        }, 100);
      }
    }
  }, [preselectedRoomId, rooms]);

  // Auto advance to verification step when room is selected from card
  useEffect(() => {
    if (selectedRoom && preselectedRoomId && bookingStep === 2) {
      const timer = setTimeout(() => {
        setBookingStep(3);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedRoom, preselectedRoomId, bookingStep]);

  const fetchRooms = async () => {
    if (!propertyData?.id) {
      console.error('No property ID available');
      return;
    }
    
    setRoomsLoading(true);
    setRoomsError('');
    
    try {
      console.log(`🌐 Fetching rooms for property ID: ${propertyData.id}`);
      const response = await listRoomsByProperty(Number(propertyData.id));
      
      let roomsData = [];
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          roomsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          roomsData = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          roomsData = response.data.items;
        } else if (typeof response.data === 'object' && response.data !== null) {
          roomsData = Object.values(response.data);
        }
      }
      
      if (roomsData.length > 0) {
        const transformedRooms = roomsData.map((room: any) => {
          let availableBeds = 0;
          if (room.bed_assignments && Array.isArray(room.bed_assignments)) {
            availableBeds = room.bed_assignments.filter((bed: any) => bed.is_available === 1 || bed.is_available === true).length;
          } else if (room.bed_assignments_json && Array.isArray(room.bed_assignments_json)) {
            availableBeds = room.bed_assignments_json.filter((bed: any) => bed.is_available === 1 || bed.is_available === true).length;
          } else {
            availableBeds = Number(room.available_beds || room.total_bed - room.occupied_beds || 0);
          }

          return {
            id: room.id,
            room_number: room.room_number?.toString() || `Room ${room.id}`,
            room_type: room.room_type || 'Standard',
            sharing_type: room.sharing_type || 'Shared',
            monthly_rent: Number(room.rent_per_bed || 0),
            daily_rate: Number(room.daily_rate || Math.round(Number(room.rent_per_bed || 0) / 30) || 500),
            is_available: room.is_active === 1 || room.is_active === true,
            floor: room.floor?.toString() || 'Ground',
            total_beds: Number(room.total_bed || 1),
            available_beds: availableBeds || Number(room.total_bed || 1) - Number(room.occupied_beds || 0) || 0,
            amenities: room.amenities || [],
            gender_preference: room.room_gender_preference || []
          };
        });
        
        const availableRooms = transformedRooms.filter(room => room.is_available === true);
        setRooms(availableRooms);
        
        if (availableRooms.length === 0) {
          setRoomsError('No rooms currently available for this property');
        }
      } else {
        setRoomsError('No rooms found for this property');
      }
      
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRoomsError('Unable to load rooms. Please try again.');
    } finally {
      setRoomsLoading(false);
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'phone') {
      if (value && !validatePhone(value)) {
        setPhoneError('Please enter a valid 10-digit number');
      } else {
        setPhoneError('');
      }
    }
  }, []);

  const handleRoomSelect = useCallback((room: Room) => {
    setSelectedRoom(room);
    setFormData(prev => ({ 
      ...prev, 
      roomId: room.id.toString(),
      roomNumber: room.room_number,
      sharingType: room.sharing_type || '',
      monthlyRent: room.monthly_rent,
      dailyRate: room.daily_rate,
      floor: room.floor || 'Ground'
    }));
    console.log('✅ Room selected:', room.room_number);
  }, []);

  const handleVerificationCodeChange = useCallback((index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  }, [verificationCode]);

  const calculateRent = useCallback(() => {
    if (bookingType === 'short') {
      if (!selectedRoom) return 0;
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return days * (selectedRoom.daily_rate || propertyData?.dailyRate || 500);
    } else {
      return selectedRoom?.monthly_rent || propertyData?.monthly_rent || propertyData?.price || 0;
    }
  }, [bookingType, selectedRoom, formData, propertyData]);

  const calculateTotal = useCallback(() => {
    let rentAmount = calculateRent();
    return rentAmount;
  }, [calculateRent]);

  const calculateTotalPayable = useCallback(() => {
    if (bookingType === 'short') {
      return calculateTotal();
    } else {
      return calculateTotal() + (propertyData?.securityDeposit || 0);
    }
  }, [bookingType, calculateTotal, propertyData]);

  const handleSendOTP = useCallback(() => {
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid 10-digit number');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerificationSent(true);
      // Demo OTP
      setVerificationCode(['1', '2', '3', '4', '5', '6']);
    }, 800);
  }, [formData.phone]);

  const handleVerifyOTP = useCallback(() => {
    const otp = verificationCode.join('');
    if (otp === '123456') {
      setVerified(true);
      setBookingStep(4);
    } else {
      alert('Invalid OTP. Please try again.');
    }
  }, [verificationCode]);

  const prepareBookingData = useCallback((): BookingData => {
    return {
      salutation: formData.salutation,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      moveInDate: formData.moveInDate,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      roomId: selectedRoom?.id.toString() || '',
      roomNumber: selectedRoom?.room_number || '',
      sharingType: selectedRoom?.sharing_type || '',
      monthlyRent: selectedRoom?.monthly_rent || 0,
      dailyRate: selectedRoom?.daily_rate || 0,
      floor: selectedRoom?.floor || 'Ground',
      bookingType: bookingType,
      propertyId: propertyData?.id,
      propertyName: propertyData?.name || '',
      paymentMethod: paymentMethod,
      couponCode: formData.couponCode,
      totalAmount: calculateTotalPayable(),
      rentAmount: calculateRent(),
      securityDeposit: bookingType === 'long' ? (propertyData?.securityDeposit || 0) : 0,
      verificationStatus: verified,
      bookingStatus: paymentMethod === 'online' ? 'confirmed' : 'pending',
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending'
    };
  }, [formData, selectedRoom, bookingType, propertyData, paymentMethod, calculateTotalPayable, calculateRent, verified]);

  const handleBookingSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Step 1: Personal Info
    if (bookingStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.gender) {
        alert('Please fill all required fields');
        return;
      }
      if (!validatePhone(formData.phone)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
      if (bookingType === 'long' && !formData.moveInDate) {
        alert('Please select move-in date');
        return;
      }
      if (bookingType === 'short' && (!formData.checkInDate || !formData.checkOutDate)) {
        alert('Please select check-in and check-out dates');
        return;
      }
      
      setBookingStep(2);
      return;
    }

    // Step 2: Select Room
    if (bookingStep === 2) {
      if (!selectedRoom) {
        alert('Please select a room to continue');
        return;
      }
      setBookingStep(3);
      return;
    }

    // Step 3: Verification
    if (bookingStep === 3) {
      handleVerifyOTP();
      return;
    }

    // Step 4: Payment
    if (bookingStep === 4) {
      if (!formData.agreeToTerms) {
        alert('Please agree to terms and conditions');
        return;
      }

      setLoading(true);

      try {
        const bookingData = prepareBookingData();
        
        console.log('Submitting booking data:', bookingData);
        
        const response = await fetch('http://localhost:3001/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        const result = await response.json();

        if (result.success) {
          // Set confirmation data
          setConfirmationData({
            id: result.data.booking.id,
            roomNumber: selectedRoom?.room_number,
            totalAmount: calculateTotalPayable(),
            paymentMethod: paymentMethod
          });
          
          // Show confirmation modal instead of alert
          setShowConfirmation(true);
          
          // Call success callback
          if (onBookingSuccess) {
            onBookingSuccess(result.data);
          }
          
          // Don't close modal immediately, wait for confirmation modal to close
        } else {
          throw new Error(result.message || 'Failed to create booking');
        }

      } catch (err) {
        console.error("Error submitting booking:", err);
        alert("Error submitting booking. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  }, [bookingStep, bookingType, formData, selectedRoom, propertyData, paymentMethod, handleVerifyOTP, prepareBookingData, onBookingSuccess, calculateTotalPayable]);

  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    onClose(); // Close the booking modal
  }, [onClose]);

  if (!isOpen) return null;

  const getSharingIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'single': return <User className="w-3.5 h-3.5" />;
      case 'double': return <Users className="w-3.5 h-3.5" />;
      case 'triple': return <Users className="w-3.5 h-3.5" />;
      case 'four': return <Grid className="w-3.5 h-3.5" />;
      default: return <BedDouble className="w-3.5 h-3.5" />;
    }
  };

  const getSharingLabel = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'single': return 'Private Room';
      case 'double': return '2 Sharing';
      case 'triple': return '3 Sharing';
      case 'four': return '4 Sharing';
      default: return type || 'Shared Room';
    }
  };

  return (
    <>
      {/* Booking Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 p-1.5 rounded-md">
                <Building2 className="w-4 h-4 text-gray-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {bookingType === 'long' ? 'Long Stay Booking' : 'Short Stay Booking'}
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {propertyData?.name} - {propertyData?.area || propertyData?.property_address || 'Location'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Booking Type Toggle - Only show on step 1 */}
          {bookingStep === 1 && (
            <div className="px-4 pt-3">
              <div className="flex bg-gray-100 rounded-md p-0.5">
                <button
                  onClick={() => setBookingType('long')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    bookingType === 'long'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Long Stay (Monthly)
                </button>
                <button
                  onClick={() => setBookingType('short')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                    bookingType === 'short'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Short Stay (Daily)
                </button>
              </div>
            </div>
          )}

          {/* Selected Room Badge - Show when room is selected */}
          {selectedRoom && bookingStep > 2 && (
            <div className="px-4 pt-3">
              <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-3.5 h-3.5 text-green-600" />
                  <div>
                    <span className="text-xs font-medium text-gray-700">
                      Selected Room: <span className="text-green-700 font-semibold">{selectedRoom.room_number}</span>
                    </span>
                    <span className="text-[10px] text-gray-500 ml-2">
                      {getSharingLabel(selectedRoom.sharing_type)} • Floor {selectedRoom.floor || 'Ground'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(2);
                    setSelectedRoom(null);
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                >
                  Change Room
                </button>
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-4">
              
              {/* Progress Steps - 4 Steps */}
              <div className="flex items-center justify-between mb-4">
                {[
                  { step: 1, label: 'Personal Info' },
                  { step: 2, label: 'Select Room' },
                  { step: 3, label: 'Verify' },
                  { step: 4, label: 'Payment' }
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${bookingStep > item.step 
                          ? 'bg-green-600 text-white' 
                          : bookingStep === item.step
                          ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {bookingStep > item.step ? <Check className="w-3 h-3" /> : item.step}
                      </div>
                      <span className={`text-[10px] mt-1 font-medium ${
                        bookingStep >= item.step ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    {idx < 3 && (
                      <div className="flex-1 h-[2px] mx-2 bg-gray-200">
                        <div 
                          className="h-full bg-green-600 transition-all duration-300"
                          style={{ width: bookingStep > item.step ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                
                {/* STEP 1: Personal Information */}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-gray-200">
                      <User className="w-3.5 h-3.5 text-gray-600" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Personal Details</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Full Name with Salutation Dropdown */}
                      <div>
                        <div className="flex gap-2">
                          <div className="w-24">
                            <label className="block text-[10px] font-medium text-gray-700 mb-1">Salutation <span className="text-red-500">*</span></label>
                            <select
                              value={formData.salutation}
                              onChange={(e) => handleInputChange('salutation', e.target.value)}
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none bg-white"
                            >
                              {SALUTATIONS.map(sal => (
                                <option key={sal} value={sal}>{sal}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] font-medium text-gray-700 mb-1">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone with Country Code */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-2.5 py-1.5 text-xs border border-r-0 border-gray-300 rounded-l bg-gray-50 text-gray-600">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={formData.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              handleInputChange('phone', value);
                            }}
                            className={`flex-1 px-2.5 py-1.5 text-xs border border-gray-300 rounded-r focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none ${
                              phoneError ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="98765 43210"
                          />
                        </div>
                        {phoneError && (
                          <p className="text-[9px] text-red-600 mt-1">{phoneError}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                          placeholder="your@email.com"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <label className={`flex items-center justify-center gap-1 flex-1 p-1.5 border rounded text-xs cursor-pointer ${
                            formData.gender === 'male' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                          }`}>
                            <input 
                              type="radio" 
                              name="gender" 
                              value="male" 
                              checked={formData.gender === 'male'} 
                              onChange={(e) => handleInputChange('gender', e.target.value)} 
                              className="sr-only" 
                            />
                            <span className="text-sm">👨</span>
                            <span className="text-xs">Male</span>
                          </label>
                          <label className={`flex items-center justify-center gap-1 flex-1 p-1.5 border rounded text-xs cursor-pointer ${
                            formData.gender === 'female' ? 'border-pink-600 bg-pink-50' : 'border-gray-300'
                          }`}>
                            <input 
                              type="radio" 
                              name="gender" 
                              value="female" 
                              checked={formData.gender === 'female'} 
                              onChange={(e) => handleInputChange('gender', e.target.value)} 
                              className="sr-only" 
                            />
                            <span className="text-sm">👩</span>
                            <span className="text-xs">Female</span>
                          </label>
                          <label className={`flex items-center justify-center gap-1 flex-1 p-1.5 border rounded text-xs cursor-pointer ${
                            formData.gender === 'other' ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
                          }`}>
                            <input 
                              type="radio" 
                              name="gender" 
                              value="other" 
                              checked={formData.gender === 'other'} 
                              onChange={(e) => handleInputChange('gender', e.target.value)} 
                              className="sr-only" 
                            />
                            <span className="text-sm">⚧️</span>
                            <span className="text-xs">Other</span>
                          </label>
                        </div>
                      </div>

                      {/* Dates based on booking type */}
                      {bookingType === 'long' ? (
                        <div>
                          <label className="block text-[10px] font-medium text-gray-700 mb-1">
                            Preferred Move-in Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.moveInDate}
                            onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-700 mb-1">
                              Check-in Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={formData.checkInDate}
                              onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-medium text-gray-700 mb-1">
                              Check-out Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                              value={formData.checkOutDate}
                              onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                            />
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[8px] text-gray-500 italic">
                        Your information is secure and will only be used for booking purposes.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 2: Select Room */}
                {bookingStep === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-gray-200">
                      <DoorOpen className="w-3.5 h-3.5 text-gray-600" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Select Your Room</h3>
                    </div>

                    {roomsLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-600 mt-2">Loading available rooms...</span>
                      </div>
                    ) : roomsError ? (
                      <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
                        <Home className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-900">Unable to load rooms</p>
                        <p className="text-[10px] text-red-600 mt-1">{roomsError}</p>
                        <button
                          type="button"
                          onClick={() => fetchRooms()}
                          className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : rooms.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-center">
                        <Home className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-900">No rooms available</p>
                        <p className="text-[10px] text-gray-600 mt-1">All rooms are currently occupied</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-600">
                            {rooms.length} room{rooms.length > 1 ? 's' : ''} available
                          </p>
                          <p className="text-[9px] text-gray-500">
                            {bookingType === 'long' ? 'Monthly Rent (per bed)' : 'Daily Rate'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
                          {rooms.map((room) => (
                            <label
                              key={room.id}
                              className={`
                                relative border rounded p-2.5 cursor-pointer transition-all
                                ${selectedRoom?.id === room.id 
                                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                                }
                                ${preselectedRoomId === room.id && !selectedRoom 
                                  ? 'ring-2 ring-green-400 border-green-400' 
                                  : ''
                                }
                              `}
                            >
                              <input
                                type="radio"
                                name="room"
                                value={room.id}
                                checked={selectedRoom?.id === room.id}
                                onChange={() => handleRoomSelect(room)}
                                className="sr-only"
                              />
                              
                              {/* Room Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-1">
                                  <BedDouble className="w-3.5 h-3.5 text-gray-600" />
                                  <span className="text-xs font-semibold text-gray-900">
                                    Room {room.room_number}
                                  </span>
                                </div>
                                {selectedRoom?.id === room.id && (
                                  <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}
                                {preselectedRoomId === room.id && !selectedRoom && (
                                  <div className="text-[8px] text-white font-medium bg-green-600 px-1.5 py-0.5 rounded-full">
                                    Selected
                                  </div>
                                )}
                              </div>

                              {/* Room Details */}
                              <div className="mt-1.5 space-y-1">
                                <div className="flex items-center gap-1">
                                  {getSharingIcon(room.sharing_type)}
                                  <span className="text-[9px] text-gray-600 capitalize">
                                    {getSharingLabel(room.sharing_type)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-gray-400" />
                                  <span className="text-[9px] text-gray-600">
                                    Floor {room.floor || 'Ground'}
                                  </span>
                                </div>

                                {room.available_beds > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-gray-400" />
                                    <span className="text-[8px] text-gray-500">
                                      {room.available_beds} bed{room.available_beds > 1 ? 's' : ''} available
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Price */}
                              <div className="mt-2 pt-1.5 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-900">
                                  ₹{bookingType === 'long' 
                                    ? (room.monthly_rent || 0).toLocaleString() 
                                    : (room.daily_rate || 0).toLocaleString()
                                  }
                                </span>
                                <span className="text-[8px] text-gray-500 ml-0.5">
                                  /{bookingType === 'long' ? 'month' : 'day'}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Phone Verification */}
                {bookingStep === 3 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-gray-200">
                      <Shield className="w-3.5 h-3.5 text-gray-600" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Verify Your Number</h3>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="bg-blue-100 p-1.5 rounded">
                          <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-600">We've sent a verification code to</p>
                          <p className="text-xs font-medium">
                            {formData.salutation} {formData.fullName} • +91 {formData.phone || 'XXXXX XXXXX'}
                          </p>
                        </div>
                      </div>

                      {!verificationSent ? (
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={loading || !validatePhone(formData.phone)}
                          className="w-full py-2 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-medium text-gray-700 mb-1.5">Enter 6-digit OTP</label>
                            <div className="flex gap-1.5 justify-center">
                              {verificationCode.map((digit, index) => (
                                <input
                                  key={index}
                                  id={`otp-${index}`}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleVerificationCodeChange(index, e.target.value)}
                                  className="w-8 h-8 text-center text-xs font-medium border border-gray-300 rounded focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              className="text-[10px] text-blue-600 hover:text-blue-800"
                            >
                              Resend Code
                            </button>
                            <span className="text-[9px] text-gray-500">Use 123456 for demo</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: Payment */}
                {bookingStep === 4 && selectedRoom && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1 border-b border-gray-200">
                      <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                      <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Payment Method</h3>
                    </div>

                    {/* Guest Info Summary with Salutation */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-2">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] text-gray-700">
                          <span className="font-medium">Guest:</span> {formData.salutation} {formData.fullName}
                        </span>
                        <span className="text-[9px] text-gray-500 ml-auto">
                          {formData.email}
                        </span>
                      </div>
                    </div>

                    {/* Selected Room Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                          <div>
                            <span className="text-xs font-medium text-gray-900">
                              Room {selectedRoom.room_number}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                                {getSharingLabel(selectedRoom.sharing_type)}
                              </span>
                              <span className="text-[9px] text-gray-500">
                                Floor {selectedRoom.floor || 'Ground'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingStep(2)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    {/* Payment Methods - Inperson is default */}
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                        paymentMethod === 'online' ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="online" 
                          checked={paymentMethod === 'online'} 
                          onChange={(e) => setPaymentMethod(e.target.value as 'online')} 
                          className="sr-only" 
                        />
                        <div className="bg-blue-100 p-1 rounded">
                          <Wallet className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Pay Online</p>
                          <p className="text-[9px] text-gray-500">Credit/Debit Card, UPI</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                        paymentMethod === 'inperson' ? 'border-gray-800 bg-gray-50' : 'border-gray-200'
                      }`}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="inperson" 
                          checked={paymentMethod === 'inperson'} 
                          onChange={(e) => setPaymentMethod(e.target.value as 'inperson')} 
                          className="sr-only" 
                        />
                        <div className="bg-gray-200 p-1 rounded">
                          <Building2 className="w-3.5 h-3.5 text-gray-700" />
                        </div>
                        <div>
                          <p className="text-xs font-medium">Pay In Person</p>
                          <p className="text-[9px] text-gray-500">Cash/Card at Property</p>
                        </div>
                      </label>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <h4 className="text-[10px] font-semibold text-gray-700 mb-2">Booking Summary</h4>
                      
                      {/* Rent Amount */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] text-gray-600">
                          {bookingType === 'long' ? 'Monthly Rent (per bed)' : 'Stay Charges'}
                        </span>
                        <span className="text-xs font-medium">₹{calculateRent().toLocaleString()}</span>
                      </div>
                      
                      {/* Duration for Short Stay */}
                      {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] text-gray-500">Duration</span>
                          <span className="text-[9px] text-gray-600">
                            {Math.ceil(
                              (new Date(formData.checkOutDate).getTime() - 
                               new Date(formData.checkInDate).getTime()) 
                              / (1000 * 60 * 60 * 24)
                            )} days × ₹{selectedRoom.daily_rate || propertyData?.dailyRate || 500}/day
                          </span>
                        </div>
                      )}

                      {/* Security Deposit - ONLY for Long Stay */}
                      {bookingType === 'long' && (
                        <div className="flex justify-between items-center mb-1.5 pt-1 border-t border-gray-200">
                          <span className="text-[10px] text-gray-600">Security Deposit</span>
                          <span className="text-xs font-medium">₹{(propertyData?.securityDeposit || 0).toLocaleString()}</span>
                        </div>
                      )}

                      {/* Total */}
                      <div className="border-t border-gray-300 pt-2 mt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold">
                            {bookingType === 'long' ? 'Total Payable' : 'Total Amount'}
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            ₹{calculateTotalPayable().toLocaleString()}
                          </span>
                        </div>
                        {bookingType === 'short' && (
                          <p className="text-[8px] text-gray-500 mt-1 text-right">
                            No security deposit required for short stays
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2 p-2 bg-gray-50 border border-gray-200 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="w-3.5 h-3.5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                        required
                      />
                      <div className="text-[9px] text-gray-600">
                        I agree to the <span className="text-blue-600 font-medium">terms & conditions</span>, 
                        cancellation policy, and house rules of the property.
                      </div>
                    </label>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  {bookingStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (bookingStep === 3) {
                          setBookingStep(2);
                        } else {
                          setBookingStep(bookingStep - 1);
                        }
                      }}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={
                      loading || 
                      (bookingStep === 2 && (roomsLoading || rooms.length === 0)) ||
                      (bookingStep === 2 && !selectedRoom && rooms.length > 0)
                    }
                    className={`flex-1 py-2 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
                      bookingStep === 4
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : bookingStep === 1 ? (
                      'Continue to Room Selection'
                    ) : bookingStep === 2 ? (
                      selectedRoom ? 'Continue to Verification' : 'Select a Room'
                    ) : bookingStep === 3 ? (
                      'Verify & Continue'
                    ) : (
                      paymentMethod === 'online' ? `Pay ₹${calculateTotalPayable().toLocaleString()}` : 'Confirm Booking'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title={paymentMethod === 'online' ? 'Payment Successful!' : 'Booking Request Submitted!'}
        message={paymentMethod === 'online' 
          ? `Your booking has been confirmed. A confirmation email has been sent to ${formData.email}.`
          : `Your booking request has been submitted. Our team will contact you shortly at ${formData.phone}.`
        }
        bookingDetails={confirmationData}
      />
    </>
  );
});

export default BookingModal;