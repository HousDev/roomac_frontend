"use client";

import { useState, useCallback, useEffect, memo } from 'react';
import {
  X, User, Phone, Mail, Users, Calendar, CreditCard, FileText,
  Check, CalendarDays, IndianRupee, Shield,
  Smartphone, Wallet, Building2, Lock, DoorOpen, BedDouble,
  Home, Grid, ChevronRight, MapPin, Hash, Layers, UserCircle,
  AlertCircle, CheckCircle, XCircle, ArrowLeft, Sparkles
} from 'lucide-react';

// Room API import
import { listRoomsByProperty } from "@/lib/roomsApi";
import { createRazorpayOrder } from "../../lib/paymentApi";


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

// OTP Verification Modal Component - COMPACT
const OTPModal = ({
  isOpen,
  onClose,
  phone,
  salutation,
  fullName,
  onVerify,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  salutation: string;
  fullName: string;
  onVerify: (otp: string) => void;
  loading: boolean;
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeout(() => {
        document.getElementById('otp-0')?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }
    setError('');
    onVerify(otpString);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setError('');
    alert('OTP resent successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between mb-2.5 sm:mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Verify Number</h3>
                <p className="text-[10px] sm:text-xs text-blue-100">Secure booking</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 sm:p-1.5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <p className="text-[10px] text-blue-100 mb-0.5">OTP sent to</p>
            <p className="text-xs sm:text-sm font-semibold text-white break-words">
              {salutation} {fullName} • +91 {phone}
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 text-center">
            Enter 6-Digit OTP
          </label>

          <div className="flex gap-1.5 justify-center mb-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-9 h-11 sm:w-10 sm:h-12 text-center text-base sm:text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
            ))}
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <p className="text-[10px] sm:text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verifying...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Verify OTP
              </>
            )}
          </button>

          <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
            <button onClick={handleResend} className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
              Resend OTP
            </button>
            <span className="text-[10px] sm:text-xs text-gray-500">Use 123456 for demo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component - COMPACT
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
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-center text-gray-900 mb-2">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-600 text-center mb-4">
            {message}
          </p>

          {bookingDetails && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 mb-4 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-xs text-gray-600">Booking ID:</span>
                <span className="text-sm sm:text-base font-bold text-gray-900">#{bookingDetails.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Room:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900">{bookingDetails.roomNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Total Amount:</span>
                <span className="text-base sm:text-lg font-bold text-green-600">₹{bookingDetails.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Payment Method:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">{bookingDetails.paymentMethod}</span>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            {countdown > 0 ? `Auto-closing in ${countdown}s...` : 'Done'}
          </button>
        </div>
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
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'inperson'>('inperson');
  const [phoneError, setPhoneError] = useState('');
  const [verified, setVerified] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
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

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setBookingStep(1);
      setSelectedRoom(null);
      setRooms([]);
      setRoomsError('');
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      setShowOTPModal(false);

      if (propertyData?.id) {
        fetchRooms();
      }
    } else {
      setBookingStep(1);
      setSelectedRoom(null);
      setRooms([]);
      setRoomsError('');
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      setShowOTPModal(false);
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

  useEffect(() => {
    if (preselectedRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === preselectedRoomId);
      if (room) {
        setTimeout(() => {
          handleRoomSelect(room);
        }, 100);
      }
    }
  }, [preselectedRoomId, rooms]);

  const fetchRooms = async () => {
    if (!propertyData?.id) return;

    setRoomsLoading(true);
    setRoomsError('');

    try {
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
          setRoomsError('No rooms currently available');
        }
      } else {
        setRoomsError('No rooms found');
      }

    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRoomsError('Unable to load rooms');
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
  }, []);

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

  const handleOTPVerify = useCallback((otp: string) => {
    if (otp === '123456') {
      setLoading(true);
      setTimeout(() => {
        setVerified(true);
        setShowOTPModal(false);
        setBookingStep(2);
        setLoading(false);
      }, 800);
    } else {
      alert('Invalid OTP. Please try again.');
    }
  }, []);

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
      bookingType: bookingType === 'long' ? 'monthly' : 'daily',
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

  const submitFinalBooking = async (paymentStatus: string) => {
    setLoading(true);

    try {
      const bookingData = {
        ...prepareBookingData(),
        paymentStatus,
        bookingStatus: paymentStatus === "paid" ? "confirmed" : "pending",
      };

      const response = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      console.log("booking error : ", result, selectedRoom)
      if (result.success) {
        setConfirmationData({
          id: result.bookingId,
          roomNumber: selectedRoom?.room_number,
          totalAmount: calculateTotalPayable(),
          paymentMethod,
        });
        setShowConfirmation(true);

        if (onBookingSuccess) {
          onBookingSuccess(result.data);
        }
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error("Error submitting booking:", err);
      alert("Error submitting booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openRazorpay = async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const orderData = await createRazorpayOrder(calculateTotalPayable());

      if (!orderData || !orderData.order) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Room Booking",
        description: `Booking for ${selectedRoom?.room_number || 'Room'} at ${propertyData?.name || 'Property'}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            await submitFinalBooking("paid");
          } catch (error) {
            alert("Payment successful but booking failed. Contact support.");
          }
        },
        prefill: {
          name: `${formData.salutation} ${formData.fullName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          property_id: propertyData?.id,
          room_id: selectedRoom?.id,
          booking_type: bookingType
        },
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      alert("Unable to start payment");
      setLoading(false);
    }
  };

  const handleBookingSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

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

      setShowOTPModal(true);
      return;
    }

    if (bookingStep === 2) {
      if (!selectedRoom) {
        alert('Please select a room to continue');
        return;
      }
      setBookingStep(3);
      return;
    }

    if (bookingStep === 3) {
      if (!formData.agreeToTerms) {
        alert("Please agree to terms and conditions");
        return;
      }

      if (paymentMethod === "online") {
        await openRazorpay();
        return;
      }

      await submitFinalBooking("pending");
    }
  }, [bookingStep, bookingType, formData, selectedRoom, paymentMethod]);

  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    onClose();
  }, [onClose]);

  // Auto-close after successful booking
  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        handleConfirmationClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showConfirmation, handleConfirmationClose]);

  if (!isOpen) return null;

  const getSharingIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'single': return <User className="w-3.5 h-3.5" />;
      case 'double': return <Users className="w-3.5 h-3.5" />;
      case 'triple': return <Users className="w-3.5 h-3.5" />;
      case 'four': return <Grid className="w-3.5 h-3.5" />;
      default: return <BedDouble className="w-3.5 h-3.5" />;
    }
  };

  const getSharingLabel = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'single': return 'Private';
      case 'double': return '2 Sharing';
      case 'triple': return '3 Sharing';
      case 'four': return '4 Sharing';
      default: return type || 'Shared';
    }
  };

  return (
    <>
      {/* COMPACT MODAL - max-w-2xl instead of 4xl */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl">

          {/* COMPACT Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 sm:px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="bg-white/20 p-1.5 rounded-lg flex-shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-white text-xs sm:text-sm truncate">
                  {bookingType === 'long' ? 'Long Stay Booking' : 'Short Stay Booking'}
                </h2>
                <p className="text-[10px] sm:text-xs text-blue-100 flex items-center gap-1 truncate">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                  <span className="truncate">{propertyData?.name}</span>
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* COMPACT Type Toggle */}
          {bookingStep === 1 && (
            <div className="px-3 sm:px-4 pt-2.5">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setBookingType('long')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs font-semibold transition-all ${bookingType === 'long' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}
                >
                  <span className="hidden sm:inline">Long Stay</span>
                  <span className="sm:hidden">Long</span>
                </button>
                <button
                  onClick={() => setBookingType('short')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs font-semibold transition-all ${bookingType === 'short' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}
                >
                  <span className="hidden sm:inline">Short Stay</span>
                  <span className="sm:hidden">Short</span>
                </button>
              </div>
            </div>
          )}

          {/* COMPACT Verified Badge */}
          {verified && (
            <div className="px-3 sm:px-4 pt-2.5">
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-900 truncate">Verified</p>
                  <p className="text-[10px] text-green-700 truncate">+91 {formData.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* COMPACT Selected Room */}
          {selectedRoom && bookingStep > 2 && (
            <div className="px-3 sm:px-4 pt-2.5">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <DoorOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 truncate">Room {selectedRoom.room_number}</p>
                    <p className="text-[10px] text-gray-600 truncate">{getSharingLabel(selectedRoom.sharing_type)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBookingStep(2);
                    setSelectedRoom(null);
                  }}
                  className="text-xs text-blue-600 font-semibold whitespace-nowrap"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          {/* COMPACT Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(92vh-120px)]">
            <div className="p-3 sm:p-4">

              {/* COMPACT Progress Steps */}
              <div className="flex items-center justify-between mb-4">
                {[
                  { step: 1, label: 'Details', icon: User },
                  { step: 2, label: 'Room', icon: DoorOpen },
                  { step: 3, label: 'Payment', icon: CreditCard }
                ].map((item, idx) => (
                  <div key={item.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold transition-all ${bookingStep > item.step ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow' :
                        bookingStep === item.step ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-2 ring-blue-200 shadow' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                        {bookingStep > item.step ? <Check className="w-4 h-4" /> : <item.icon className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-[10px] sm:text-xs mt-1 font-semibold ${bookingStep >= item.step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.label}
                      </span>
                    </div>
                    {idx < 2 && (
                      <div className="flex-1 h-0.5 mx-1 sm:mx-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                          style={{ width: bookingStep > item.step ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-3">

                {/* STEP 1 - COMPACT */}
                {bookingStep === 1 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
                      <User className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                    </div>

                    <div className="space-y-2.5">
                      {/* Name Row - COMPACT */}
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.salutation}
                            onChange={(e) => handleInputChange('salutation', e.target.value)}
                            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none bg-white"
                          >
                            {SALUTATIONS.map(sal => <option key={sal} value={sal}>{sal}</option>)}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                            placeholder="Enter your full name"
                          />
                        </div>
                      </div>

                      {/* Contact Row - COMPACT */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="flex">
                            <span className="inline-flex items-center px-2 py-2 text-[11px] sm:text-xs border-2 border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 font-semibold">
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
                              className={`flex-1 px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 ${phoneError ? 'border-red-500' : 'border-gray-300'} rounded-r-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none`}
                              placeholder="98765 43210"
                            />
                          </div>
                          {phoneError && (
                            <p className="text-[9px] sm:text-[10px] text-red-600 mt-0.5 flex items-center gap-0.5">
                              <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                              {phoneError}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>

                      {/* Gender - COMPACT */}
                      <div>
                        <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['male', 'female', 'other'].map((gender) => (
                            <label
                              key={gender}
                              className={`flex items-center justify-center gap-1 p-2 border-2 rounded-lg cursor-pointer transition-all capitalize ${formData.gender === gender
                                ? gender === 'male' ? 'border-blue-500 bg-blue-50 shadow' :
                                  gender === 'female' ? 'border-pink-500 bg-pink-50 shadow' :
                                    'border-purple-500 bg-purple-50 shadow'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={gender}
                                checked={formData.gender === gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                className="sr-only"
                              />
                              <span className="text-base sm:text-lg">
                                {gender === 'male' ? '👨' : gender === 'female' ? '👩' : '⚧️'}
                              </span>
                              <span className="text-[10px] sm:text-xs font-semibold">{gender}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Dates - COMPACT */}
                      {bookingType === 'long' ? (
                        <div>
                          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                            Move-in Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.moveInDate}
                            onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                              <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                                Check-in <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={new Date().toISOString().split('T')[0]}
                              value={formData.checkInDate}
                              onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                            />
                          </div>
                          <div>
                              <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                                Check-out <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              required
                              min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                              value={formData.checkOutDate}
                              onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                                className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-start gap-1.5">
                        <Shield className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[9px] sm:text-[10px] text-blue-900">
                          Secure & encrypted. Phone verification in next step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 - COMPACT ROOMS */}
                {bookingStep === 2 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
                      <DoorOpen className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">Select Room</h3>
                    </div>

                    {roomsLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-9 h-9 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-xs text-gray-600 mt-2.5">Loading rooms...</span>
                      </div>
                    ) : roomsError ? (
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                          <Home className="w-9 h-9 text-red-400 mx-auto mb-2" />
                          <p className="text-xs font-bold text-gray-900 mb-1">Unable to load</p>
                          <p className="text-[10px] text-red-600 mb-3">{roomsError}</p>
                        <button
                          type="button"
                          onClick={() => fetchRooms()}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : rooms.length === 0 ? (
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                            <Home className="w-9 h-9 text-yellow-500 mx-auto mb-2" />
                            <p className="text-xs font-bold text-gray-900">No rooms available</p>
                      </div>
                    ) : (
                            <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-gray-700">
                            {rooms.length} room{rooms.length > 1 ? 's' : ''} available
                          </p>
                                <p className="text-[10px] text-gray-500">
                                  {bookingType === 'long' ? 'Monthly' : 'Daily'}
                          </p>
                        </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                          {rooms.map((room) => (
                            <label
                              key={room.id}
                              className={`border-2 rounded-lg p-2.5 cursor-pointer transition-all hover:shadow ${selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50 shadow ring-1 ring-blue-200' : 'border-gray-200 bg-white'
                                }`}
                            >
                              <input
                                type="radio"
                                name="room"
                                value={room.id}
                                checked={selectedRoom?.id === room.id}
                                onChange={() => handleRoomSelect(room)}
                                className="sr-only"
                              />

                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center flex-shrink-0">
                                    <BedDouble className="w-3.5 h-3.5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-gray-900">Room {room.room_number}</p>
                                    <p className="text-[10px] text-gray-500">Floor {room.floor || 'G'}</p>
                                  </div>
                                </div>
                                {selectedRoom?.id === room.id && (
                                  <CheckCircle className="w-4 h-4 text-blue-600" />
                                )}
                              </div>

                              <div className="space-y-1 mb-2">
                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                  {getSharingIcon(room.sharing_type)}
                                  <span className="font-medium">{getSharingLabel(room.sharing_type)}</span>
                                </div>

                                {room.available_beds > 0 && (
                                  <div className="flex items-center gap-1 text-[9px] text-gray-500">
                                    <Users className="w-3 h-3" />
                                    <span>{room.available_beds} bed{room.available_beds > 1 ? 's' : ''}</span>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-gray-200">
                                <span className="text-sm font-bold text-gray-900">
                                  ₹{bookingType === 'long' ? room.monthly_rent.toLocaleString() : room.daily_rate.toLocaleString()}
                                </span>
                                <span className="text-[9px] text-gray-500 ml-0.5">
                                  /{bookingType === 'long' ? 'mo' : 'day'}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3 - COMPACT PAYMENT */}
                {bookingStep === 3 && selectedRoom && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900">Payment</h3>
                    </div>

                    {/* Guest Summary - COMPACT */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {formData.salutation} {formData.fullName}
                          </p>
                          <p className="text-[10px] text-gray-600 truncate">
                            {formData.email} • +91 {formData.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods - COMPACT */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-300'
                          }`}>
                          <input type="radio" name="paymentMethod" value="online" checked={paymentMethod === 'online'} onChange={(e) => setPaymentMethod(e.target.value as 'online')} className="sr-only" />
                          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900">Online</p>
                            <p className="text-[9px] text-gray-500">UPI, Card</p>
                          </div>
                          {paymentMethod === 'online' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                        </label>

                        <label className={`flex items-center gap-2 p-2.5 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'inperson' ? 'border-gray-800 bg-gray-50 shadow' : 'border-gray-300'
                          }`}>
                          <input type="radio" name="paymentMethod" value="inperson" checked={paymentMethod === 'inperson'} onChange={(e) => setPaymentMethod(e.target.value as 'inperson')} className="sr-only" />
                          <div className="w-9 h-9 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-900">In Person</p>
                            <p className="text-[9px] text-gray-500">At Property</p>
                          </div>
                          {paymentMethod === 'inperson' && <CheckCircle className="w-4 h-4 text-gray-800" />}
                        </label>
                      </div>
                    </div>

                    {/* Price Summary - COMPACT */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-xs font-bold text-gray-900 mb-2.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        Summary
                      </h4>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] sm:text-xs text-gray-700">
                            {bookingType === 'long' ? 'Monthly Rent' : 'Stay Charges'}
                          </span>
                          <span className="text-xs font-bold text-gray-900">₹{calculateRent().toLocaleString()}</span>
                        </div>

                        {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
                          <div className="flex justify-between items-center text-[9px] text-gray-600">
                            <span>Duration</span>
                            <span>
                              {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days × ₹{selectedRoom.daily_rate}/day
                            </span>
                          </div>
                        )}

                        {bookingType === 'long' && (
                          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                            <span className="text-[10px] sm:text-xs text-gray-700">Security Deposit</span>
                            <span className="text-xs font-bold text-gray-900">₹{(propertyData?.securityDeposit || 0).toLocaleString()}</span>
                          </div>
                        )}

                        <div className="border-t-2 border-blue-300 pt-2.5 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm font-bold text-gray-900">
                              {bookingType === 'long' ? 'Total Payable' : 'Total'}
                            </span>
                            <span className="text-lg sm:text-xl font-bold text-blue-600">
                              ₹{calculateTotalPayable().toLocaleString()}
                            </span>
                          </div>
                          {bookingType === 'short' && (
                            <p className="text-[9px] text-gray-600 mt-1 text-right">No deposit for short stays</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms - COMPACT */}
                    <label className="flex items-start gap-2 p-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
                      <input
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                        className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600 flex-shrink-0"
                        required
                      />
                      <div className="text-[10px] text-gray-700">
                        I agree to <span className="text-blue-600 font-semibold">terms & conditions</span>, cancellation policy, and house rules.
                      </div>
                    </label>
                  </div>
                )}

                {/* COMPACT Navigation */}
                <div className="flex gap-2 pt-3 border-t-2 border-gray-200">
                  {bookingStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setBookingStep(bookingStep - 1)}
                      className="flex items-center justify-center gap-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || (bookingStep === 2 && (roomsLoading || !selectedRoom))}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow ${bookingStep === 3 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      } disabled:opacity-50`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="hidden sm:inline">Processing...</span>
                      </>
                    ) : bookingStep === 1 ? (
                        <>
                          Verify & Continue
                          <ChevronRight className="w-4 h-4" />
                        </>
                    ) : bookingStep === 2 ? (
                          selectedRoom ? (
                            <>
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </>
                          ) : (
                            'Select Room'
                          )
                        ) : (
                          <>
                            {paymentMethod === 'online' ? `Pay ₹${calculateTotalPayable().toLocaleString()}` : 'Confirm Booking'}
                            <Check className="w-4 h-4" />
                          </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phone={formData.phone}
        salutation={formData.salutation}
        fullName={formData.fullName}
        onVerify={handleOTPVerify}
        loading={loading}
      />

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        title={paymentMethod === 'online' ? 'Payment Successful!' : 'Booking Submitted!'}
        message={paymentMethod === 'online'
          ? `Confirmation sent to ${formData.email}`
          : `We'll contact you at ${formData.phone}`
        }
        bookingDetails={confirmationData}
      />
    </>
  );
});

export default BookingModal;