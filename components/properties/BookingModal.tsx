// components/properties/BookingModal.tsx
"use client";

import { useState, useCallback, useEffect, memo, useRef } from 'react';
import {
  X, User, Phone, Mail, Users, Calendar, CreditCard, FileText,
  Check, CalendarDays, IndianRupee, Shield,
  Smartphone, Wallet, Building2, Lock, DoorOpen, BedDouble,
  Home, Grid, ChevronRight, MapPin, Hash, Layers, UserCircle,
  AlertCircle, CheckCircle, XCircle, ArrowLeft, Sparkles, Heart,
  Bed, Ticket, Gift, Percent, Clock, Tag, Star,
  Upload,
  Building
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { listRoomsByProperty } from "@/lib/roomsApi";
import { createRazorpayOrder } from "../../lib/paymentApi";
import { consumeMasters } from "@/lib/masterApi";
import { toast } from 'sonner';

// Add this interface after the existing interfaces
interface PartnerDetails {
  // fullName: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  relationship: string;
}

interface DocumentDetails {
  idProofType: string;
  idProofNumber: string;
  idProofFile: File | null;
  addressProofType: string;
  addressProofNumber: string;
  addressProofFile: File | null;
  partnerIdProofType: string;
  partnerIdProofNumber: string;
  partnerIdProofFile: File | null;
  partnerAddressProofType: string;
  partnerAddressProofNumber: string;
  partnerAddressProofFile: File | null;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  setBookingType: (type: string) => void;
  propertyData: any;
  preselectedRoomId?: number | null;
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
  occupied_beds: number;
  amenities?: string[];
  gender_preference?: string[];
  current_occupants_gender?: string[];
  room_gender_preference?: string[];
   beds?: {
    bed_number: number;
    bed_type: string;
    bed_rent: number;
    is_occupied: boolean;
    tenant_id?: number | null;
    assignment_id?: number | null;
  }[];
  bed_assignments?: any[];
}

interface MasterValue {
  id: number;
  name: string;
  isactive: number;
}

interface BookingData {
  salutation: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  isCouple: boolean;
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

// OTP Verification Modal Component
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
              {/* Show original amount if discounted */}
    {bookingDetails.originalAmount > bookingDetails.totalAmount && (
      <>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Original Amount:</span>
          <span className="text-xs text-gray-500 line-through">₹{bookingDetails.originalAmount?.toLocaleString()}</span>
        </div>
        {bookingDetails.offerCode && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">Offer Applied:</span>
            <span className="text-xs font-semibold text-green-600">{bookingDetails.offerCode}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Discount:</span>
          <span className="text-xs font-semibold text-green-600">- ₹{bookingDetails.discountAmount?.toLocaleString()}</span>
        </div>
      </>
    )}
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

const isRoomAllowedForGender = (room: any, gender: string, isCouple: boolean): boolean => {
  if (!gender) return false;
  
  const preferences = room.gender_preference || [];
  if (preferences.length === 0) return true;
  
  const normalizedGender = gender.toLowerCase();
  
  if (isCouple) {
    const hasCouples = preferences.some((p: string) => 
      p.toLowerCase() === 'couples'
    );
    const hasBoth = preferences.some((p: string) => 
      p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
    );
    
    const genderAllowed = preferences.some((p: string) => {
      const prefLower = p.toLowerCase();
      if (normalizedGender === 'male') {
        return prefLower === 'male_only' || prefLower === 'male' || prefLower === 'both' || prefLower === 'mixed' || prefLower === 'couples';
      } else if (normalizedGender === 'female') {
        return prefLower === 'female_only' || prefLower === 'female' || prefLower === 'both' || prefLower === 'mixed' || prefLower === 'couples';
      }
      return false;
    });
    
    return (hasCouples || hasBoth) && genderAllowed;
  }
  
  if (normalizedGender === 'male') {
    const hasMaleOnly = preferences.some((p: string) => 
      p.toLowerCase() === 'male_only' || p.toLowerCase() === 'male'
    );
    const hasBoth = preferences.some((p: string) => 
      p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
    );
    const hasCouples = preferences.some((p: string) => p.toLowerCase() === 'couples');
    const hasFemaleOnly = preferences.some((p: string) => 
      p.toLowerCase() === 'female_only' || p.toLowerCase() === 'female'
    );
    
    if (hasFemaleOnly && !hasMaleOnly && !hasBoth && !hasCouples) {
      return false;
    }
    
    return hasMaleOnly || hasBoth || hasCouples;
  }
  
  if (normalizedGender === 'female') {
    const hasFemaleOnly = preferences.some((p: string) => 
      p.toLowerCase() === 'female_only' || p.toLowerCase() === 'female'
    );
    const hasBoth = preferences.some((p: string) => 
      p.toLowerCase() === 'both' || p.toLowerCase() === 'any' || p.toLowerCase() === 'mixed'
    );
    const hasCouples = preferences.some((p: string) => p.toLowerCase() === 'couples');
    const hasMaleOnly = preferences.some((p: string) => 
      p.toLowerCase() === 'male_only' || p.toLowerCase() === 'male'
    );
    
    if (hasMaleOnly && !hasFemaleOnly && !hasBoth && !hasCouples) {
      return false;
    }
    
    return hasFemaleOnly || hasBoth || hasCouples;
  }
  
  return false;
};

const formatSharingType = (type: string): string => {
  switch (type?.toLowerCase()) {
    case 'single': return 'Private Room';
    case 'double': return '2 Sharing';
    case 'triple': return '3 Sharing';
    case 'other': return 'Shared Room';
    default: return type || 'Shared';
  }
};

const getSharingIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'single': return <User className="w-3.5 h-3.5" />;
    case 'double': return <Users className="w-3.5 h-3.5" />;
    case 'triple': return <Users className="w-3.5 h-3.5" />;
    case 'other': return <BedDouble className="w-3.5 h-3.5" />;
    default: return <BedDouble className="w-3.5 h-3.5" />;
  }
};

const getSharingCapacity = (type: string): number => {
  switch (type?.toLowerCase()) {
    case 'single': return 1;
    case 'double': return 2;
    case 'triple': return 3;
    case 'other': return 4;
    default: return 2;
  }
};

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
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'inperson'>('inperson');
  const [phoneError, setPhoneError] = useState('');
  const [verified, setVerified] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [selectedSharingType, setSelectedSharingType] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Masters data
  const [roomsMasters, setRoomsMasters] = useState<Record<string, MasterValue[]>>({});
  const [loadingMasters, setLoadingMasters] = useState(false);
  
  const preselectionAttempted = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedBed, setSelectedBed] = useState<{roomId: number, bedNumber: number, bedRent: number} | null>(null);
  
  // Offer Code States
  const [offerCode, setOfferCode] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState('');
  const [offerSuccess, setOfferSuccess] = useState('');
  const [discountedAmount, setDiscountedAmount] = useState(0);
  // Inside your BookingModal component, add these states
const [showTermsModal, setShowTermsModal] = useState(false);
const [termsContent, setTermsContent] = useState<string>('');
const [loadingTerms, setLoadingTerms] = useState(false);

// Add these after the existing refs (around line 150-160)
const idProofInputRef = useRef<HTMLInputElement>(null);
const addressProofInputRef = useRef<HTMLInputElement>(null);
const partnerIdProofInputRef = useRef<HTMLInputElement>(null);
const partnerAddressProofInputRef = useRef<HTMLInputElement>(null);
// Add this state with your other states
const [enquiryCreated, setEnquiryCreated] = useState(false);
const [enquiryId, setEnquiryId] = useState(null);
const [isCreatingEnquiry, setIsCreatingEnquiry] = useState(false);
const [previousEmail , setPreviousEmail] = useState('');

const [availableOffers, setAvailableOffers] = useState<any[]>([]);
const [loadingOffers, setLoadingOffers] = useState(false);
const [bookedRoomIds, setBookedRoomIds] = useState<Set<number>>(new Set());

const [propertyHasAvailableRooms, setPropertyHasAvailableRooms] = useState(true);

  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    firstName: '',  // Add this
  lastName: '',   // Add thi
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    isCouple: false,
    moveInDate: '',
    checkInDate: '',
    checkOutDate: '',
    guests: "1",
    sharingType: '',
    roomId: '',
    roomNumber: '',
     bedNumber: '', 
    monthlyRent: 0,
    dailyRate: 0,
    floor: '',
    couponCode: '',
    agreeToTerms: false
  });

  const [partnerDetails, setPartnerDetails] = useState<PartnerDetails>({
    firstName: '',
  lastName: '',
  // fullName: '',
  phone: '',
  email: '',
  gender: '',
  dateOfBirth: '',
  relationship: 'Spouse' 
});

const [documentDetails, setDocumentDetails] = useState<DocumentDetails>({
  idProofType: '',
  idProofNumber: '',
  idProofFile: null,
  addressProofType: '',
  addressProofNumber: '',
  addressProofFile: null,
  partnerIdProofType: '',
  partnerIdProofNumber: '',
  partnerIdProofFile: null,
  partnerAddressProofType: '',
  partnerAddressProofNumber: '',
  partnerAddressProofFile: null,
});

  // Add this function to combine first and last name for backend
const combineFullName = useCallback(() => {
  const firstName = (formData.firstName || '').trim();
  const lastName = (formData.lastName || '').trim();
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  }
  return '';
}, [formData.firstName, formData.lastName]);

// Update fullName whenever firstName or lastName changes
useEffect(() => {
  const combinedName = combineFullName();
  setFormData(prev => ({ ...prev, fullName: combinedName }));
}, [combineFullName]);

// Calculate Rent
const calculateRent = useCallback(() => {
  if (!selectedBed) return 0;
  
  if (bookingType === 'short') {
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;
    
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return days * selectedBed.bedRent;
  } else {
    // Long stay - monthly rent
    return selectedBed.bedRent;
  }
}, [bookingType, selectedBed, formData]);

// Calculate Total (just the rent amount)
const calculateTotal = useCallback(() => {
  return calculateRent();
}, [calculateRent]);

// Calculate Total Payable (rent + security deposit for long stay)
const calculateTotalPayable = useCallback(() => {
  if (bookingType === 'short') {
    return calculateTotal();
  } else {
    // Long stay: Rent + Security Deposit
    return calculateTotal() + (propertyData?.securityDeposit || 0);
  }
}, [bookingType, calculateTotal, propertyData]);

// Calculate Final Amount after discount
const calculateFinalAmount = useCallback(() => {
  const totalPayable = calculateTotalPayable();
  return totalPayable - discountedAmount;
}, [calculateTotalPayable, discountedAmount]);


// Validate and Apply Offer
const validateAndApplyOffer = useCallback(async (code: string) => {
  if (!code || code.trim() === '') {
    setOfferError('');
    setAppliedOffer(null);
    setDiscountedAmount(0);
    return;
  }

  setOfferLoading(true);
  setOfferError('');
  setOfferSuccess('');

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`);
    const offers = await response.json();

    
    const cleanInputCode = code.trim().toUpperCase();
    
    const offer = offers.find((o: any) => {
      const cleanOfferCode = o.code?.toString().trim().toUpperCase();
      
      const isActive = o.is_active === true || 
                       o.is_active === 1 || 
                       o.is_active === 'true' || 
                       o.is_active === '1';
      
      return cleanOfferCode === cleanInputCode && isActive;
    });


    if (!offer) {
      setOfferError('Invalid offer code');
      setAppliedOffer(null);
      setDiscountedAmount(0);
      setOfferSuccess('');
      return;
    }

      // Check if offer is for a specific room and validate against selected room
    if (offer.room_id && selectedRoom && selectedRoom.id !== offer.room_id) {
      setOfferError(`This offer is only valid for Room ${offer.room_number || offer.room_id}. Please select the correct room.`);
      setAppliedOffer(null);
      setDiscountedAmount(0);
      return;
    }

    // Check if offer is for a specific bed and validate against selected bed
    if (offer.bed_number && selectedBed && selectedBed.bedNumber !== offer.bed_number) {
      setOfferError(`This offer is only valid for a specific bed. Please select the correct bed.`);
      setAppliedOffer(null);
      setDiscountedAmount(0);
      return;
    }


    // Check if offer is active
    const isActive = offer.is_active === true || 
                     offer.is_active === 1 || 
                     offer.is_active === 'true' || 
                     offer.is_active === '1';
    
    if (!isActive) {
      setOfferError('This offer is no longer active');
      setAppliedOffer(null);
      return;
    }

    // Validate offer end date
    if (offer.end_date) {
      const endDate = new Date(offer.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        setOfferError(`Offer expired on ${endDate.toLocaleDateString()}`);
        setAppliedOffer(null);
        return;
      }
    }

    // Validate offer start date
    if (offer.start_date) {
      const startDate = new Date(offer.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate > today) {
        setOfferError(`Offer starts on ${startDate.toLocaleDateString()}`);
        setAppliedOffer(null);
        return;
      }
    }

    // For short stay, check if offer is for short stay (optional)
    // You can add a field to offers table for stay_type or just let all offers apply to both
    
    // Property-specific check
    if (offer.property_id && offer.property_id !== propertyData?.id) {
      setOfferError(`This offer is for a different property`);
      setAppliedOffer(null);
      return;
    }

    // Store the offer with room and bed info
    setAppliedOffer({
      ...offer,
      room_id: offer.room_id,
      room_number: offer.room_number,
      bed_number: offer.bed_number
    });

    let discountAmount = 0;
    const baseAmount = calculateTotalPayable();

   
    // Calculate discount based on type
    if (offer.discount_type === 'percentage' && offer.discount_percent) {
      const percentage = parseFloat(offer.discount_percent);
      discountAmount = baseAmount * (percentage / 100);
    } else if (offer.discount_type === 'fixed' && offer.discount_value) {
      const fixedAmount = parseFloat(offer.discount_value);
      discountAmount = fixedAmount;
    } else {
      if (offer.discount_percent && parseFloat(offer.discount_percent) > 0) {
        const percentage = parseFloat(offer.discount_percent);
        discountAmount = baseAmount * (percentage / 100);
      } else if (offer.discount_value && parseFloat(offer.discount_value) > 0) {
        discountAmount = parseFloat(offer.discount_value);
      } else {
        setOfferError('Invalid discount configuration');
        setAppliedOffer(null);
        return;
      }
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, baseAmount);


    setAppliedOffer(offer);
    setDiscountedAmount(discountAmount);
    
    // Create success message based on booking type
    let successMessage = `Offer applied! You save ₹${discountAmount.toLocaleString()}`;
    
    // Show offer validity period if min_months is set
    if (offer.min_months && offer.min_months > 0) {
      successMessage += ` (Valid for ${offer.min_months} month${offer.min_months !== 1 ? 's' : ''})`;
    }
    
    // Check bonus validity if present
    if (offer.bonus_valid_until) {
      const bonusEndDate = new Date(offer.bonus_valid_until);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (bonusEndDate < today) {
        successMessage = `Offer applied! Bonus expired on ${bonusEndDate.toLocaleDateString()}. You save ₹${discountAmount.toLocaleString()}`;
      } else if (offer.bonus_title) {
        successMessage = `Offer applied! 🎁 Bonus: ${offer.bonus_title} - You save ₹${discountAmount.toLocaleString()}`;
        if (offer.min_months && offer.min_months > 0) {
          successMessage += ` (Valid for ${offer.min_months} month${offer.min_months !== 1 ? 's' : ''})`;
        }
      }
    }
    
    setOfferSuccess(successMessage);
    setOfferError('');

  } catch (error) {
    console.error('Error validating offer:', error);
    setOfferError('Failed to validate offer');
  } finally {
    setOfferLoading(false);
  }
}, [bookingType, propertyData?.id, calculateTotalPayable]);

useEffect(() => {
  // If there's an applied offer that has a specific room_id
  if (appliedOffer && appliedOffer.room_id) {
    // Check if the selected room exists and matches
    if (selectedRoom && selectedRoom.id !== appliedOffer.room_id) {
      setAppliedOffer(null);
      setOfferCode('');
      setDiscountedAmount(0);
      setOfferError('');
      setOfferSuccess('');
      toast.warning(`This offer is only valid for a specific room. Offer has been removed.`);
    }
  }
}, [selectedRoom, appliedOffer]);

// Also add for bed selection
useEffect(() => {
  // If there's an applied offer that has a specific bed_number
  if (appliedOffer && appliedOffer.bed_number) {
    // Check if the selected bed exists and matches
    if (selectedBed && selectedBed.bedNumber !== appliedOffer.bed_number) {
      setAppliedOffer(null);
      setOfferCode('');
      setDiscountedAmount(0);
      setOfferError('');
      setOfferSuccess('');
      toast.warning(`This offer is only valid for a specific bed. Offer has been removed.`);
    }
  }
}, [selectedBed, appliedOffer]);

  // Load saved offer from localStorage when modal opens
// Load saved offer from localStorage when modal opens
useEffect(() => {
  if (isOpen) {
    const savedOfferCode = localStorage.getItem('pendingOfferCode');
    const savedOfferData = localStorage.getItem('pendingOfferData');
    
    if (savedOfferCode) {
      setOfferCode(savedOfferCode);
      if (savedOfferData) {
        try {
          const offerData = JSON.parse(savedOfferData);
          // Check if offer is for this property or is general
          if (!offerData.propertyId || offerData.propertyId === propertyData?.id) {
            // Small delay to ensure component is ready
            setTimeout(() => {
              validateAndApplyOffer(savedOfferCode);
            }, 100);
          }
        } catch (e) {
          console.error('Error parsing saved offer data:', e);
        }
      } else {
        // If no offer data, just validate the code
        setTimeout(() => {
          validateAndApplyOffer(savedOfferCode);
        }, 100);
        localStorage.removeItem('pendingOfferCode');
      }
    }
  }
}, [isOpen, propertyData?.id, validateAndApplyOffer]);
  // Reset offer when booking type changes
  useEffect(() => {
    setOfferCode('');
    setAppliedOffer(null);
    setDiscountedAmount(0);
    setOfferError('');
    setOfferSuccess('');
  }, [bookingType]);

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

  const fetchRoomsMasters = async () => {
    setLoadingMasters(true);
    try {
      const res = await consumeMasters({ tab: "Rooms" });
      if (res?.success && res.data) {
        const grouped: Record<string, MasterValue[]> = {};
        res.data.forEach((item: any) => {
          const type = item.type_name;
          if (!grouped[type]) {
            grouped[type] = [];
          }
          grouped[type].push({
            id: item.value_id,
            name: item.value_name,
            isactive: 1,
          });
        });
        setRoomsMasters(grouped);
      }
    } catch (error) {
      console.error("Failed to fetch rooms masters:", error);
    } finally {
      setLoadingMasters(false);
    }
  };

  const fetchRooms = async (resetFilters = true) => {
    if (!propertyData?.id) return;

    setRoomsLoading(true);
    setRoomsError('');

    try {
      const response: any = await listRoomsByProperty(Number(propertyData.id));
      
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
          const bedAssignments = room.bed_assignments || [];
          
          const beds = bedAssignments.map((assignment: any) => {
            return {
              bed_number: assignment.bed_number,
              bed_type: assignment.bed_type || '',
              bed_rent: assignment.tenant_rent ? Number(assignment.tenant_rent) : 0,
              is_occupied: assignment.is_available === 0 && assignment.tenant_id !== null,
              tenant_id: assignment.tenant_id || null,
              assignment_id: assignment.id,
              is_couple: assignment.is_couple || false
            };
          });

          beds.sort((a, b) => a.bed_number - b.bed_number);
          const availableBeds = beds.filter(bed => !bed.is_occupied).length;
          const occupiedBeds = beds.filter(bed => bed.is_occupied).length;
          const genderPreference = room.room_gender_preference || [];

          return {
            id: room.id,
            room_number: room.room_number?.toString() || `Room ${room.id}`,
            room_type: room.room_type || '',
            sharing_type: room.sharing_type || 'double',
            monthly_rent: Number(room.rent_per_bed || 0),
            daily_rate: Number(room.daily_rate || Math.round(Number(room.rent_per_bed || 0) / 30) || 500),
            is_available: room.is_active === 1 || room.is_active === true,
            floor: room.floor?.toString() || 'Ground',
            total_beds: beds.length,
            available_beds: availableBeds,
            occupied_beds: occupiedBeds,
            amenities: room.amenities || [],
            gender_preference: genderPreference,
            current_occupants_gender: room.current_occupants_gender || [],
            room_gender_preference: genderPreference,
            beds: beds,
            raw_bed_assignments: bedAssignments
          };
        });
        
        const availableRooms = transformedRooms.filter((room: any) => room.is_available === true);
        setAllRooms(availableRooms);
        
        if (resetFilters) {
          setSelectedSharingType('all');
          setSelectedRoomType('all');
        }
        
        let filteredRooms = [...availableRooms];
        
        if (formData.gender) {
          filteredRooms = filteredRooms.filter((room: any) => 
            isRoomAllowedForGender(room, formData.gender, formData.isCouple)
          );
        }
        
        if (selectedSharingType && selectedSharingType !== 'all') {
          filteredRooms = filteredRooms.filter((room: any) => 
            room.sharing_type?.toLowerCase() === selectedSharingType.toLowerCase()
          );
        }

        if (selectedRoomType && selectedRoomType !== 'all') {
          filteredRooms = filteredRooms.filter((room: any) => 
            room.room_type?.toLowerCase() === selectedRoomType.toLowerCase()
          );
        }
        
        setRooms(filteredRooms);

        if (filteredRooms.length === 0) {
          setRoomsError('No rooms match your filters');
        } else {
          setRoomsError('');
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

  const clearFilters = () => {
    setSelectedSharingType('all');
    setSelectedRoomType('all');
    
    if (allRooms && allRooms.length > 0 && formData.gender) {
      let filtered = [...allRooms];
      
      filtered = filtered.filter(room => 
        isRoomAllowedForGender(room, formData.gender, formData.isCouple)
      );
      
      setRooms(filtered);
      setRoomsError(filtered.length === 0 ? 'No rooms match your selection' : '');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBookingStep(1);
      setSelectedRoom(null);
      setSelectedBed(null);
      setRooms([]);
      setRoomsError('');
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      setShowOTPModal(false);
      setSelectedSharingType('all');
      setSelectedRoomType('all');
      setShowFilters(false);
      preselectionAttempted.current = false;

      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      setFormData(prev => ({
        ...prev,
        salutation: 'Mr.',
        fullName: '',
        email: '',
        phone: '',
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
        agreeToTerms: false,
        gender: '',
        isCouple: false
      }));

      if (propertyData?.id) {
        fetchRooms(true);
        fetchRoomsMasters();
      }
    } else {
      setBookingStep(1);
      setSelectedRoom(null);
      setSelectedBed(null);
      setRooms([]);
      setRoomsError('');
      setVerified(false);
      setPaymentMethod('inperson');
      setShowConfirmation(false);
      setConfirmationData(null);
      setShowOTPModal(false);
      setSelectedSharingType('all');
      setSelectedRoomType('all');
      setShowFilters(false);
      setFormData({
        salutation: 'Mr.',
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        isCouple: false,
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [bookingStep]);

  useEffect(() => {
  if (preselectedRoomId) {
    // console.log('🎯 BookingModal received preselectedRoomId:', preselectedRoomId);
  }
}, [preselectedRoomId]);

  useEffect(() => {
    if (preselectedRoomId && rooms.length > 0 && !selectedRoom && !preselectionAttempted.current) {
      const preselectedIdStr = String(preselectedRoomId);
      const room = rooms.find(r => String(r.id) === preselectedIdStr);
      
      if (room) {
        preselectionAttempted.current = true;
        setSelectedRoom(room);
         // Auto-select the first available bed in that room
      if (room.beds && room.beds.length > 0) {
        const availableBed = room.beds.find((bed: any) => !bed.is_occupied);
        if (availableBed) {
          setSelectedBed({
            roomId: room.id,
            bedNumber: availableBed.bed_number,
            bedRent: availableBed.bed_rent
          });
        }
      }

        const genderPref = room.gender_preference || [];
        let autoGender = '';
        let autoIsCouple = false;
        
        if (genderPref.includes('couples')) {
          autoIsCouple = true;
        }
        
        if (genderPref.includes('male_only') || genderPref.includes('male')) {
          autoGender = 'male';
        } else if (genderPref.includes('female_only') || genderPref.includes('female')) {
          autoGender = 'female';
        } else if (genderPref.includes('both') || genderPref.includes('mixed')) {
          autoGender = 'male';
        }
        
        setFormData(prev => ({
          ...prev,
          roomId: room.id.toString(),
          roomNumber: room.room_number,
          sharingType: room.sharing_type || '',
          monthlyRent: room.monthly_rent,
          dailyRate: room.daily_rate,
          floor: room.floor || 'Ground',
          gender: autoGender || prev.gender,
          isCouple: autoIsCouple
        }));
      }
    }
  }, [preselectedRoomId, rooms, selectedRoom]);

  useEffect(() => {
    if (allRooms && allRooms.length > 0 && formData.gender) {
      let filtered = [...allRooms];

      filtered = filtered.filter(room => 
        isRoomAllowedForGender(room, formData.gender, formData.isCouple)
      );

      if (selectedSharingType && selectedSharingType !== 'all') {
        filtered = filtered.filter(room => 
          room.sharing_type?.toLowerCase() === selectedSharingType.toLowerCase()
        );
      }

      if (selectedRoomType && selectedRoomType !== 'all') {
        filtered = filtered.filter(room => 
          room.room_type?.toLowerCase() === selectedRoomType.toLowerCase()
        );
      }

      setRooms(filtered);

      if (selectedRoom && !filtered.some(r => r.id === selectedRoom.id)) {
        setSelectedRoom(null);
        setFormData(prev => ({
          ...prev,
          roomId: '',
          roomNumber: '',
          sharingType: '',
          monthlyRent: 0,
          dailyRate: 0,
          floor: ''
        }));
      }

      if (filtered.length === 0) {
        setRoomsError('No rooms match your filters');
      } else {
        setRoomsError('');
      }
    }
  }, [formData.gender, formData.isCouple, allRooms, selectedSharingType, selectedRoomType, selectedRoom]);

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

  const validateOfferForRoom = useCallback((offerData: any, roomId: number) => {
  // If no offer is applied, return true (no validation needed)
  if (!appliedOffer) return true;
  
  // If the offer has a room_id and it doesn't match the selected room
  if (appliedOffer.room_id && appliedOffer.room_id !== roomId) {
    // Clear the offer
    setAppliedOffer(null);
    setOfferCode('');
    setDiscountedAmount(0);
    setOfferError('');
    setOfferSuccess('');
    toast.warning(`This offer is only valid for the specific room. Offer has been removed.`);
    return false;
  }
  
  // If the offer has a bed_number, we need to validate bed selection too
  // (We'll handle that in bed selection)
  return true;
}, [appliedOffer]);


  const handleRoomSelect = useCallback((room: Room) => {
    setSelectedRoom(room);
    setSelectedBed(null);

// Validate offer against selected room
  if (appliedOffer && appliedOffer.room_id) {
    const isValid = validateOfferForRoom(appliedOffer, room.id);
    if (!isValid) {
      // Clear the selected bed as well since offer is removed
      setSelectedBed(null);
    }
  }
    
    const genderPref = room.gender_preference || [];
    let autoGender = formData.gender;
    let autoIsCouple = formData.isCouple;
    
    if (genderPref.includes('couples')) {
      autoIsCouple = true;
    }
    
    if (formData.gender) {
      const isGenderAllowed = genderPref.some((p: string) => {
        const prefLower = p.toLowerCase();
        if (formData.gender === 'male') {
          return prefLower === 'male_only' || prefLower === 'male' || prefLower === 'both' || prefLower === 'mixed' || prefLower === 'couples';
        } else if (formData.gender === 'female') {
          return prefLower === 'female_only' || prefLower === 'female' || prefLower === 'both' || prefLower === 'mixed' || prefLower === 'couples';
        }
        return false;
      });
      
      if (!isGenderAllowed) {
        if (genderPref.includes('male_only') || genderPref.includes('male')) {
          autoGender = 'male';
        } else if (genderPref.includes('female_only') || genderPref.includes('female')) {
          autoGender = 'female';
        } else {
          autoGender = 'male';
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      roomId: room.id.toString(),
      roomNumber: room.room_number,
      sharingType: room.sharing_type || '',
      monthlyRent: room.monthly_rent,
      dailyRate: room.daily_rate,
      floor: room.floor || 'Ground',
      gender: autoGender,
      isCouple: autoIsCouple
    }));
  }, [formData.gender, formData.isCouple,  appliedOffer, validateOfferForRoom]);

  // Update handleBedSelect (if you have a separate bed selection function)
const handleBedSelect = useCallback((room: Room, bed: any) => {
  // Validate offer against the bed if the offer has a specific bed number
  if (appliedOffer && appliedOffer.bedNumber) {
    if (appliedOffer.bedNumber !== bed.bed_number) {
      setAppliedOffer(null);
      setOfferCode('');
      setDiscountedAmount(0);
      setOfferError('');
      setOfferSuccess('');
      toast.warning(`This offer is only valid for a specific bed. Offer has been removed.`);
      return;
    }
  }
  
  setSelectedRoom(room);
  setSelectedBed(bed);
  
  setFormData(prev => ({
    ...prev,
    roomId: room.id.toString(),
    roomNumber: room.room_number,
    bedNumber: bed.bed_number,
    sharingType: room.sharing_type || '',
    monthlyRent: bed.bed_rent,
    floor: room.floor || 'Ground'
  }));
}, [appliedOffer]);

  const getMinTenantRent = (room: any): number => {
    if (room.bed_assignments && Array.isArray(room.bed_assignments) && room.bed_assignments.length > 0) {
      const rents = room.bed_assignments
        .map((bed: any) => {
          let rent = null;
          if (bed.tenant_rent) {
            rent = parseFloat(bed.tenant_rent);
          }
          return rent && !isNaN(rent) && rent > 0 ? rent : null;
        })
        .filter((rent: number | null) => rent !== null);
      
      if (rents.length > 0) {
        return Math.min(...rents);
      }
    }
    
    if (room.beds && Array.isArray(room.beds) && room.beds.length > 0) {
      const rents = room.beds
        .map((bed: any) => {
          let rent = null;
          if (bed.bed_rent) {
            rent = parseFloat(bed.bed_rent);
          } else if (bed.tenant_rent) {
            rent = parseFloat(bed.tenant_rent);
          }
          return rent && !isNaN(rent) && rent > 0 ? rent : null;
        })
        .filter((rent: number | null) => rent !== null);
      
      if (rents.length > 0) {
        return Math.min(...rents);
      }
    }
    
    if (room.price) {
      const price = parseFloat(room.price);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }
    
    if (room.rent_per_bed) {
      const rent = parseFloat(room.rent_per_bed);
      if (!isNaN(rent) && rent > 0) {
        return rent;
      }
    }
    
    return 5000;
  };

const createEnquiryAtStep1 = async () => {
  try {
    // Combine first and last name directly
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
    const tenantName = fullName || formData.email || formData.phone || "Guest";

     // Combine partner name if couple booking
    let partnerInfo = '';
    if (formData.isCouple) {
      const partnerFullName = `${partnerDetails.firstName} ${partnerDetails.lastName}`.trim();
      partnerInfo = `, Partner: ${partnerFullName} (${partnerDetails.phone})`;
    }
    
    
     const enquiryData = {
      previousEmail: previousEmail, // Pass previous email for backend to check duplicates
      tenant_name: tenantName,
      email: formData.email,
      phone: formData.phone,
      property_id: propertyData?.id,
      property_name: propertyData?.name,
      preferred_move_in_date: bookingType === 'long' ? formData.moveInDate : formData.checkInDate,
      budget_range: `₹${calculateTotalPayable().toLocaleString()} per ${bookingType === 'long' ? 'month' : 'day'}`,
      message: `Booking enquiry for ${bookingType === 'long' ? 'Long Stay' : 'Short Stay'}. ${formData.isCouple ? 'Couple Booking' : 'Individual'}${partnerInfo}`,
      source: 'website',
      status: 'new',
      occupation: formData.occupation_category || null,
      occupation_category: formData.occupation_category || null,
      remark: `Gender: ${formData.gender}, ${formData.isCouple ? 'Couple Booking' : 'Individual'}`
    };

    // Send to backend - let backend handle the duplicate check
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/create-or-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData),
    });

    const result = await response.json();
    
    if (result.success) {
      setPreviousEmail(formData.email);
      setEnquiryCreated(true);
      setEnquiryId(result.data.id);
      return true;
    } else {
      console.error('Failed to process enquiry:', result);
      return false;
    }
  } catch (error) {
    console.error('Error processing enquiry:', error);
    return false;
  }
};

// Function to fetch Payment Terms and Conditions
const fetchPaymentTerms = useCallback(async () => {
  setLoadingTerms(true);
  try {
    // Fetch from Common tab (where Payment Terms and Conditions is stored)
    const response = await consumeMasters({ tab: "Common" });
    
    if (response?.success && response.data) {
      // Find ALL Payment Terms and Conditions entries
      const allPaymentTerms = response.data.filter(
        (item: any) => item.type_name === "Payment Terms and Conditions"
      );
      
      
      if (allPaymentTerms.length > 0) {
        // Combine all terms into a formatted list
        const formattedTerms = allPaymentTerms
          .map((term: any, index: number) => {
            // Format as numbered list with proper spacing
            return `${index + 1}. ${term.value_name}`;
          })
          .join('\n\n');
        
        setTermsContent(formattedTerms);
      } else {
        console.warn('Payment Terms and Conditions not found in masters');
    
      }
    } else {
      console.error('Failed to fetch masters:', response);
      
    }
  } catch (error) {
    console.error("❌ Error fetching payment terms:", error);
    
  } finally {
    setLoadingTerms(false);
  }
}, []);

const handleOTPVerify = useCallback(async (otp: string) => {
  if (otp === '123456') {
    // Prevent multiple submissions
    if (isCreatingEnquiry) {
      toast.info("Please wait, enquiry is being processed...");
      return;
    }
    
    setLoading(true);
    setIsCreatingEnquiry(true);
    
    try {
      // After OTP verification, create enquiry (or use existing)
      const enquirySuccess = await createEnquiryAtStep1();
      
      if (enquirySuccess) {
        setVerified(true);
        setShowOTPModal(false);
        setBookingStep(2);
      } else {
        toast.error("Failed to create enquiry. Please try again.");
      }
    } catch (error) {
      console.error('Error in OTP verification:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setIsCreatingEnquiry(false);
    }
  } else {
    alert('Invalid OTP. Please try again.');
  }
}, [createEnquiryAtStep1, isCreatingEnquiry]);

useEffect(() => {
  if (formData.phone || formData.email) {
    // Reset enquiry state when user changes contact info
    setEnquiryCreated(false);
    setEnquiryId(null);
  }
}, [formData.phone, formData.email]);

const prepareBookingData = useCallback((): any => {
  const partnerFullName = `${partnerDetails.firstName} ${partnerDetails.lastName}`.trim();
  const originalAmount = calculateTotalPayable();
  const finalAmount = calculateFinalAmount();
  const discountAmountValue = originalAmount - finalAmount;
  
  return {
    salutation: formData.salutation,
    fullName: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    gender: formData.gender,
    isCouple: formData.isCouple,
    moveInDate: formData.moveInDate,
    checkInDate: formData.checkInDate,
    checkOutDate: formData.checkOutDate,
    roomId: selectedRoom?.id.toString() || '',
    roomNumber: selectedRoom?.room_number || '',
    bedNumber: selectedBed?.bedNumber?.toString() || '',
    sharingType: selectedRoom?.sharing_type || '',
    monthlyRent: selectedBed?.bedRent || selectedRoom?.monthly_rent || 0,
    dailyRate: selectedRoom?.daily_rate || 0,
    floor: selectedRoom?.floor || 'Ground',
    bookingType: bookingType === 'long' ? 'monthly' : 'daily',
    propertyId: propertyData?.id,
    propertyName: propertyData?.name || '',
    paymentMethod: paymentMethod,
    couponCode: formData.couponCode,
    
    // Amount fields
    totalAmount: finalAmount,  // Final amount after discount
    originalAmount: originalAmount,  // Original amount before discount
    discountAmount: discountAmountValue,  // How much was discounted
    rentAmount: calculateRent(),
    securityDeposit: bookingType === 'long' ? (propertyData?.securityDeposit || 0) : 0,
    
    // Offer details
    offerCode: appliedOffer?.code || null,
    offerId: appliedOffer?.id || null,
    offerTitle: appliedOffer?.title || null,
    discountType: appliedOffer?.discount_type || null,
    
    verificationStatus: verified,
    bookingStatus: paymentMethod === 'online' ? 'confirmed' : 'pending',
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',

    // Documents
    id_proof_type: documentDetails.idProofType,
    id_proof_number: documentDetails.idProofNumber,
    address_proof_type: documentDetails.addressProofType,
    address_proof_number: documentDetails.addressProofNumber,
    
    // Partner details
    partner_full_name: partnerFullName,
    partner_phone: partnerDetails.phone,
    partner_email: partnerDetails.email,
    partner_gender: partnerDetails.gender,
    partner_date_of_birth: partnerDetails.dateOfBirth,
    partner_relationship: partnerDetails.relationship || "Spouse",
    
    // Partner ID Proof
    partner_id_proof_type: documentDetails.partnerIdProofType,
    partner_id_proof_number: documentDetails.partnerIdProofNumber,
    
    // Partner ADDRESS Proof
    partner_address_proof_type: documentDetails.partnerAddressProofType,
    partner_address_proof_number: documentDetails.partnerAddressProofNumber,
  };
}, [formData, selectedRoom, selectedBed, bookingType, propertyData, paymentMethod, calculateFinalAmount, calculateRent, calculateTotalPayable, verified, partnerDetails, documentDetails, appliedOffer]);

const submitFinalBooking = async (paymentStatus: string) => {
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    const bookingData = prepareBookingData();
    
    // Append all booking data to FormData
    Object.keys(bookingData).forEach(key => {
      if (bookingData[key] !== null && bookingData[key] !== undefined) {
        if (typeof bookingData[key] === 'string' || typeof bookingData[key] === 'number' || typeof bookingData[key] === 'boolean') {
          formDataToSend.append(key, String(bookingData[key]));
        }
      }
    });
    
    // Append files
    if (documentDetails.idProofFile) {
      formDataToSend.append('id_proof_url', documentDetails.idProofFile);
    }
    if (documentDetails.addressProofFile) {
      formDataToSend.append('address_proof_url', documentDetails.addressProofFile);
    }
    if (formData.isCouple) {
      if (documentDetails.partnerIdProofFile) {
        formDataToSend.append('partner_id_proof_url', documentDetails.partnerIdProofFile);
      }
      if (documentDetails.partnerAddressProofFile) {
        formDataToSend.append('partner_address_proof_url', documentDetails.partnerAddressProofFile);
      }
    }

    // Add enquiry ID to the booking data
    if (enquiryId) {
      formDataToSend.append('enquiry_id', enquiryId.toString());
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings`, {
      method: 'POST',
      body: formDataToSend, // Use FormData, not JSON
    });

    const result = await response.json();
    if (result.success) {
       // Update the enquiry status to 'converted' after successful booking
      if (enquiryId) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/${enquiryId}/convert`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            booking_id: result.bookingId,
            payment_method: paymentMethod,
            status: 'converted'
          }),
        });
      }
      
      setConfirmationData({
        id: result.bookingId,
        roomNumber: selectedRoom?.room_number,
        bedNumber: selectedBed?.bedNumber,
        totalAmount: calculateFinalAmount(),
        paymentMethod,
        isCouple: formData.isCouple,
        appliedOffer: appliedOffer?.code
      });
      setShowConfirmation(true);

      if (onBookingSuccess) {
        onBookingSuccess(result.data);
      }
      localStorage.removeItem('pendingOfferCode');
      localStorage.removeItem('pendingOfferData');
    } else {
      throw new Error(result.message || 'Failed to create booking');
    }
  } catch (err) {
    console.error("Error submitting booking:", err);
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

      const orderData = await createRazorpayOrder(calculateTotalPayable() - discountedAmount);

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
          booking_type: bookingType,
          is_couple: formData.isCouple,
          gender: formData.gender,
          offer_code: appliedOffer?.code || null,
          discount_amount: discountedAmount
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
    // Check first name and last name instead of fullName
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Please enter both first name and last name');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter email');
      return;
    }
    if (!formData.phone.trim()) {
      alert('Please enter phone number');
      return;
    }
    if (!formData.gender) {
      alert('Please select gender');
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

    // Add partner details validation
if (formData.isCouple) {
  // Combine first and last name for validation
  const partnerFullName = `${partnerDetails.firstName} ${partnerDetails.lastName}`.trim();
  
  if (!partnerFullName || !partnerDetails.phone || !partnerDetails.gender) {
    toast.error("Please fill in all required partner details (Full Name, Phone, Gender)");
    return;
  }
  
  // Validate partner phone
  if (!validatePhone(partnerDetails.phone)) {
    toast.error("Please enter a valid 10-digit phone number for partner");
    return;
  }
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
    
    
    // Validate primary tenant documents
    if (!documentDetails.idProofType || !documentDetails.idProofNumber || !documentDetails.idProofFile) {
      toast.error("Please upload your ID proof document");
      
      return;
    }
    if (!documentDetails.addressProofType || !documentDetails.addressProofNumber || !documentDetails.addressProofFile) {
      toast.error("Please upload your address proof document");
      return;
    }
    
    // Validate partner documents if couple booking
    if (formData.isCouple) {
      if (!documentDetails.partnerIdProofType || !documentDetails.partnerIdProofNumber || !documentDetails.partnerIdProofFile) {
        toast.error("Please upload partner's ID proof document");
        return;
      }
      if (!documentDetails.partnerAddressProofType || !documentDetails.partnerAddressProofNumber || !documentDetails.partnerAddressProofFile) {
        toast.error("Please upload partner's address proof document");
        return;
      }
    }
    
    setBookingStep(4);
    return;
  }

  if (bookingStep === 4) {
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
}, [bookingStep, bookingType, formData, selectedRoom, paymentMethod, partnerDetails, documentDetails, validatePhone]);

  const handleConfirmationClose = useCallback(() => {
    setShowConfirmation(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        handleConfirmationClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showConfirmation, handleConfirmationClose]);

  
  // Add this function inside your BookingModal component
const fetchAvailableOffers = useCallback(async () => {
  if (!propertyData?.id) return [];
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/offers`);
    const allOffers = await response.json();
    
    // Filter active offers for this property
    const activeOffers = allOffers.filter((offer: any) => {
      // Check if offer is active
      const isActive = offer.is_active === true || 
                       offer.is_active === 1 || 
                       offer.is_active === 'true';
      
      if (!isActive) return false;
      
      // Check date validity
      let isValidDate = true;
      if (offer.start_date) {
        const startDate = new Date(offer.start_date);
        const today = new Date();
        if (startDate > today) isValidDate = false;
      }
      if (offer.end_date && isValidDate) {
        const endDate = new Date(offer.end_date);
        const today = new Date();
        if (endDate < today) isValidDate = false;
      }
      
      if (!isValidDate) return false;
      
      // Filter by property
      if (offer.property_id && offer.property_id !== propertyData.id) return false;
      
      // Filter by selected room (if offer is room-specific)
      if (offer.room_id && selectedRoom && offer.room_id !== selectedRoom.id) return false;
      
      return true;
    });
    
    // Sort by display order
    activeOffers.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
    
    return activeOffers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
}, [propertyData?.id, selectedRoom]);

// Fetch booked rooms for this property
const fetchBookedRooms = useCallback(async () => {
  if (!propertyData?.id) return;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/property/${propertyData.id}?status=active`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // Get unique room IDs that are already booked
      const bookedRoomIdsSet = new Set(
        result.data
          .filter((booking: any) => booking.status === 'active')
          .map((booking: any) => booking.room_id)
      );
      setBookedRoomIds(bookedRoomIdsSet);
    }
  } catch (error) {
    console.error('Error fetching booked rooms:', error);
  }
}, [propertyData?.id]);
// Update the loadOffers useEffect to also fetch booked rooms
useEffect(() => {
  if (isOpen && bookingStep === 4 && propertyData?.id) {
    const loadData = async () => {
      setLoadingOffers(true);
      try {
        // Fetch both offers and booked rooms in parallel
        const [offersResponse, bookingsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/api/offers`),
          fetch(`${import.meta.env.VITE_API_URL}/api/bookings/property/${propertyData.id}?status=active`)
        ]);
        
        const allOffers = await offersResponse.json();
        const bookingsResult = await bookingsResponse.json();
        
        // Get booked room IDs
        const bookedRoomIdsSet = new Set(
          bookingsResult.success && bookingsResult.data
            ? bookingsResult.data
                .filter((booking: any) => booking.status === 'active')
                .map((booking: any) => booking.room_id)
            : []
        );
        setBookedRoomIds(bookedRoomIdsSet);
        
        // Filter offers
        const activeOffers = allOffers.filter((offer: any) => {
          const isActive = offer.is_active === true || offer.is_active === 1 || offer.is_active === 'true';
          if (!isActive) return false;
          
          // Date validation
          let isValidDate = true;
          if (offer.start_date) {
            const startDate = new Date(offer.start_date);
            const today = new Date();
            if (startDate > today) isValidDate = false;
          }
          if (offer.end_date && isValidDate) {
            const endDate = new Date(offer.end_date);
            const today = new Date();
            if (endDate < today) isValidDate = false;
          }
          if (!isValidDate) return false;
          
          // Property filter
          if (offer.property_id && offer.property_id !== propertyData.id) return false;
          
          if (offer.room_id) {
  // This is a room-specific offer
  if (selectedRoom) {
    // If a room is selected, only show if it matches the selected room
    if (offer.room_id !== selectedRoom.id) {
      return false; // Wrong room selected
    }
    // Check if this specific room is already fully booked
    if (bookedRoomIdsSet.has(offer.room_id)) {
      return false; // Room is fully booked, don't show offer
    }
  } else {
    // No room selected yet, but we still need to check if this room is available
    if (bookedRoomIdsSet.has(offer.room_id)) {
      return false; // Room is fully booked, don't show offer
    }
    // Room is available, show the offer even without room selected
  }
}
          
          return true;
        });
        
        activeOffers.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
        setAvailableOffers(activeOffers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingOffers(false);
      }
    };
    loadData();
  }
}, [isOpen, bookingStep, propertyData?.id, selectedRoom]);

  if (!isOpen) return null;


  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

          {/* Header - Fixed */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-3 sm:px-4 py-2.5 flex items-center justify-between flex-shrink-0">
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

          {bookingStep === 1 && (
            <div className="px-3 sm:px-4 pt-2.5 flex-shrink-0">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setBookingType('long')}
                  className={`flex-1 py-1.5 sm:py-2 rounded-md text-xs font-semibold transition-all ${bookingType === 'long' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'}`}
                >
                  <span className="hidden sm:inline">Long </span>
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

          {/* Progress Steps - Fixed */}
          <div className="flex justify-center w-full mt-2 mb-3 px-2 flex-shrink-0">
            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full max-w-xs sm:max-w-md mx-auto">
              {[
                { step: 1, label: 'Details', icon: User },
                { step: 2, label: 'Room', icon: DoorOpen },
                 { step: 3, label: 'Documents', icon: FileText },
                { step: 4, label: 'Payment', icon: CreditCard }
              ].map((item, idx) => (
                <div key={item.step} className="flex items-center gap-3 sm:gap-6">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-semibold transition-all ${
                        bookingStep > item.step
                          ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow'
                          : bookingStep === item.step
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-2 ring-blue-200 shadow'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {bookingStep > item.step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <item.icon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs mt-1 font-semibold ${
                        bookingStep >= item.step ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className="w-8 sm:w-16 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                        style={{ width: bookingStep > item.step ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Verified/Selected Badges - Fixed */}
          {(verified || (selectedRoom && bookingStep > 2)) && (
            <div className="px-3 sm:px-4 pt-2.5 flex-shrink-0">
              <div className="flex gap-2">
                {verified && (
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-green-900 truncate">Verified</p>
                      <p className="text-[10px] text-green-700 truncate">+91 {formData.phone}</p>
                    </div>
                  </div>
                )}

                {selectedRoom && bookingStep > 2 && (
                  <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <DoorOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          Room {selectedRoom.room_number}
                        </p>
                        <p className="text-[10px] text-gray-600 truncate">
                          {formatSharingType(selectedRoom.sharing_type)}
                          {formData.isCouple && ' • 👫 Couple'}
                        </p>
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
                )}
              </div>
            </div>
          )}

          {/* Scrollable Content Area */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-4 py-2"
            style={{ maxHeight: 'calc(90vh - 180px)' }}
          >
            <form onSubmit={handleBookingSubmit} className="space-y-3 pb-4">
              {/* STEP 1 */}
              {bookingStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
                    <User className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-gray-900">Personal Info</h3>
                  </div>

                  <div className="space-y-2.5">
                    {/* Salutation and Name Row */}
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
      <div className="col-span-3 grid grid-cols-2 gap-2">
        {/* First Name */}
        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
            placeholder="Enter first name"
          />
        </div>
        {/* Last Name */}
        <div>
          <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-[11px] sm:text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
            placeholder="Enter last name"
          />
        </div>
      </div>
    </div>

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

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-[10px] sm:text-xs font-semibold text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['male', 'female'].map((gender) => (
                          <label
                            key={gender}
                            className={`flex items-center justify-center gap-1 p-2 border-2 rounded-lg cursor-pointer transition-all capitalize ${
                              formData.gender === gender
                                ? gender === 'male' ? 'border-blue-500 bg-blue-50 shadow' :
                                  'border-pink-500 bg-pink-50 shadow'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="gender"
                              value={gender}
                              checked={formData.gender === gender}
                              onChange={(e) => {
                                const newGender = e.target.value;
                                handleInputChange('gender', newGender);
                              }}
                              className="sr-only"
                            />
                            <span className="text-base sm:text-lg">
                              {gender === 'male' ? '👨' : '👩'}
                            </span>
                            <span className="text-[10px] sm:text-xs font-semibold">{gender}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Couple Booking Checkbox */}
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="isCouple"
                        checked={formData.isCouple}
                        onChange={(e) => handleInputChange('isCouple', e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <label htmlFor="isCouple" className="flex items-center gap-1 text-xs font-medium text-gray-700 cursor-pointer">
                        <Heart className="w-4 h-4 text-red-500" />
                        Booking for Couple
                      </label>
                    </div>

                    {/* Partner Details Section - Only show when isCouple is true */}
{formData.isCouple && (
  <div className="mt-4 p-3 border-2 border-pink-200 rounded-lg bg-pink-50/30">
    <div className="flex items-center gap-2 mb-3">
      <Heart className="h-4 w-4 text-pink-600" />
      <h4 className="text-xs font-bold text-pink-800">Partner Details</h4>
      <Badge variant="outline" className="text-[9px] bg-pink-100 text-pink-700 border-pink-200">
        Required for couple booking
      </Badge>
    </div>

    <div className="grid grid-cols-2 gap-2">
      {/* Partner Full Name */}
      <div className="col-span-2">
        <Label className="text-[10px] font-semibold text-pink-700">Partner Full Name *</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <Input
              value={partnerDetails.firstName}
              onChange={(e) => setPartnerDetails(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              className="h-7 text-[10px] border-pink-200 focus:border-pink-500"
              required={formData.isCouple}
            />
          </div>
          <div>
            <Input
              value={partnerDetails.lastName}
              onChange={(e) => setPartnerDetails(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
              className="h-7 text-[10px] border-pink-200 focus:border-pink-500"
              required={formData.isCouple}
            />
          </div>
        </div>
      </div>
      
      {/* Partner Phone with +91 prefix */}
      <div>
        <Label className="text-[10px] font-semibold text-pink-700">Partner Phone *</Label>
        <div className="flex mt-1">
          <span className="inline-flex items-center px-2 py-1 text-[11px] border-2 border-r-0 border-pink-200 rounded-l-lg bg-pink-50 text-pink-600 font-semibold">
            +91
          </span>
          <Input
            type="tel"
            value={partnerDetails.phone}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPartnerDetails(prev => ({ ...prev, phone: value }));
            }}
            placeholder="9876543210"
            className="flex-1 h-7 text-[10px] border-pink-200 focus:border-pink-500 rounded-l-none"
            maxLength={10}
            required={formData.isCouple}
          />
        </div>
      </div>
      
      {/* Partner Email */}
      <div>
        <Label className="text-[10px] font-semibold text-pink-700">Partner Email</Label>
        <Input
          type="email"
          value={partnerDetails.email}
          onChange={(e) => setPartnerDetails(prev => ({ ...prev, email: e.target.value }))}
          placeholder="partner@email.com"
          className="h-7 text-[10px] mt-0.5 border-pink-200 focus:border-pink-500"
        />
      </div>
      
      {/* Partner Gender */}
      <div>
        <Label className="text-[10px] font-semibold text-pink-700">Partner Gender *</Label>
        <Select 
          value={partnerDetails.gender} 
          onValueChange={(v) => setPartnerDetails(prev => ({ ...prev, gender: v }))}
        >
          <SelectTrigger className="h-7 text-[10px] mt-0.5 border-pink-200">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Partner Date of Birth with 18 years age restriction */}
      <div>
        <Label className="text-[10px] font-semibold text-pink-700">Partner Date of Birth</Label>
        <div className="relative mt-1">
          <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <Input
            type="date"
            value={partnerDetails.dateOfBirth}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const minDate = new Date();
              minDate.setFullYear(minDate.getFullYear() - 18);
              
              if (selectedDate > minDate) {
                toast.error("Partner must be at least 18 years old");
                return;
              }
              setPartnerDetails(prev => ({ ...prev, dateOfBirth: e.target.value }));
            }}
            max={(() => {
              const date = new Date();
              date.setFullYear(date.getFullYear() - 18);
              return date.toISOString().split('T')[0];
            })()}
            className={`pl-8 h-7 text-[10px] border-pink-200 focus:border-pink-500`}
          />
        </div>
      </div>
      {/* Partner Relationship - Add this to the partner details section */}
<div>
  <Label className="text-[10px] font-semibold text-pink-700">Relationship</Label>
  <Select 
    value={partnerDetails.relationship} 
    onValueChange={(v) => setPartnerDetails(prev => ({ ...prev, relationship: v }))}
  >
    <SelectTrigger className="h-7 text-[10px] mt-0.5 border-pink-200">
      <SelectValue placeholder="Select relationship" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="Spouse">Spouse</SelectItem>
      <SelectItem value="Partner">Partner</SelectItem>
      <SelectItem value="Fiancé">Fiancé</SelectItem>
      <SelectItem value="Fiancée">Fiancée</SelectItem>
      <SelectItem value="Other">Other</SelectItem>
    </SelectContent>
  </Select>
</div>
    </div>
  </div>
)}

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

              {/* STEP 2 - ROOM SELECTION */}
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
                      <p className="text-xs font-bold text-gray-900 mb-1">No rooms available</p>
                      <p className="text-[10px] text-red-600 mb-3">{roomsError}</p>
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="px-4 py-2 bg-gray-600 text-white text-xs font-semibold rounded-lg hover:bg-gray-700"
                        >
                          Clear Filters
                        </button>
                        <button
                          type="button"
                          onClick={() => fetchRooms(true)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : allRooms.length === 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                      <Home className="w-9 h-9 text-yellow-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-900">No rooms available</p>
                      <button
                        type="button"
                        onClick={() => fetchRooms(true)}
                        className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700"
                      >
                        Refresh
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Selection Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 flex items-center gap-2">
                        {formData.gender === 'male' && <span className="text-base">👨</span>}
                        {formData.gender === 'female' && <span className="text-base">👩</span>}
                        <span className="text-xs font-medium text-gray-700 capitalize">{formData.gender}</span>
                        {formData.isCouple && (
                          <>
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-medium text-gray-700">Couple Booking</span>
                          </>
                        )}
                      </div>

                      {/* Filter Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium text-gray-700">Filter Rooms</span>
                          {(selectedSharingType !== 'all' || selectedRoomType !== 'all') && (
                            <Badge className="bg-blue-100 text-blue-800 text-[8px] px-1.5 py-0">
                              {selectedSharingType !== 'all' && selectedRoomType !== 'all' ? '2' : '1'} active
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-500 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Filter Options */}
                      {showFilters && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                          {/* Sharing Type Filter */}
                          {roomsMasters["Sharing Type"] && roomsMasters["Sharing Type"].length > 0 && (
                            <div>
                              <label className="block text-[9px] font-medium text-gray-700 mb-1.5">
                                Sharing Type
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedSharingType('all')}
                                  className={`px-2 py-1 text-[9px] rounded-full border transition-all ${
                                    selectedSharingType === 'all'
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  All
                                </button>
                                {roomsMasters["Sharing Type"].map((type) => {
                                  const typeName = type.name.toLowerCase();
                                  return (
                                    <button
                                      key={type.id}
                                      type="button"
                                      onClick={() => setSelectedSharingType(typeName)}
                                      className={`px-2 py-1 text-[9px] rounded-full border transition-all ${
                                        selectedSharingType === typeName
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                      }`}
                                    >
                                      {type.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Active Filters Summary */}
                          {(selectedSharingType !== 'all' || selectedRoomType !== 'all') && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-[8px] text-gray-500">Active filters:</span>
                                <button
                                  type="button"
                                  onClick={clearFilters}
                                  className="text-[8px] text-red-600 hover:text-red-800 font-medium"
                                >
                                  Clear all
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedSharingType !== 'all' && (
                                  <Badge className="bg-blue-100 text-blue-800 text-[7px] px-1.5 py-0">
                                    {selectedSharingType}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Room Count */}
                      <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-semibold text-gray-700">
                          {rooms.length} room{rooms.length > 1 ? 's' : ''} available
                        </p>
                        <p className="text-[9px] text-gray-500">
                          {bookingType === 'long' ? 'Monthly' : 'Daily'}
                        </p>
                      </div>

                      {/* Rooms Grid - Show Individual Beds */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1 pb-2">
                        {rooms.map((room) => {
                          const beds = room.beds || [];
                          const availableBeds = beds.filter((bed: any) => !bed.is_occupied);
                          
                          return (
                            <div
                              key={room.id}
                              className={`border-2 rounded-lg p-3 transition-all ${
                                selectedRoom?.id === room.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                                    <DoorOpen className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">Room {room.room_number}</p>
                                    <p className="text-[10px] text-gray-500">Floor {room.floor || 'G'}</p>
                                  </div>
                                </div>
                                <Badge className={`text-[9px] ${
                                  availableBeds.length > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {availableBeds.length} bed{availableBeds.length !== 1 ? 's' : ''} available
                                </Badge>
                              </div>

                              {/* Room Type and Gender */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                <Badge className="text-[8px] bg-gray-100 text-black">
                                  {formatSharingType(room.sharing_type)}
                                </Badge>
                                {room.room_gender_preference?.map((pref: string) => {
                                  const prefLower = pref.toLowerCase();
                                  if (prefLower === 'male_only' || prefLower === 'male') {
                                    return <Badge key={pref} className="text-[8px] bg-blue-100 text-blue-800">♂ Male</Badge>;
                                  } else if (prefLower === 'female_only' || prefLower === 'female') {
                                    return <Badge key={pref} className="text-[8px] bg-pink-100 text-pink-800">♀ Female</Badge>;
                                  } else if (prefLower === 'couples') {
                                    return <Badge key={pref} className="text-[8px] bg-red-100 text-red-800">💑 Couples</Badge>;
                                  } else if (prefLower === 'both' || prefLower === 'mixed') {
                                    return <Badge key={pref} className="text-[8px] bg-purple-100 text-purple-800">👥 Mixed</Badge>;
                                  }
                                  return null;
                                })}
                              </div>

                              {/* Individual Beds */}
                              <div className="space-y-1.5 mt-2">
                                {beds.map((bed: any) => {
                                  const isBedAvailable = !bed.is_occupied;
                                  const isSelected = selectedBed?.roomId === room.id && selectedBed?.bedNumber === bed.bed_number;
                                  
                                  return (
                                    <div
                                      key={bed.bed_number}
                                      className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${
                                        isSelected
                                          ? 'border-blue-500 bg-blue-100'
                                          : isBedAvailable
                                            ? 'border-green-200 hover:border-green-400 bg-green-50/50'
                                            : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                      }`}
                                      onClick={() => {
                                        if (isBedAvailable) {
                                          setSelectedRoom(room);
                                          setSelectedBed({
                                            roomId: room.id,
                                            bedNumber: bed.bed_number,
                                            bedRent: bed.bed_rent
                                          });
                                          setFormData(prev => ({
                                            ...prev,
                                            roomId: room.id.toString(),
                                            roomNumber: room.room_number,
                                            bedNumber: bed.bed_number,
                                            sharingType: room.sharing_type || '',
                                            monthlyRent: bed.bed_rent,
                                            floor: room.floor || 'Ground'
                                          }));
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Bed className={`w-3.5 h-3.5 ${isBedAvailable ? 'text-green-600' : 'text-gray-400'}`} />
                                        <div>
                                          <span className="text-xs font-medium">Bed {bed.bed_number}</span>
                                          {bed.bed_type && (
                                            <span className="text-[9px] text-gray-500 ml-1">({bed.bed_type})</span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-green-700">
                                          ₹{Number(bed.bed_rent).toLocaleString()}
                                        </span>
                                        {isSelected && (
                                          <CheckCircle className="w-4 h-4 text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Room Amenities */}
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                                {room.ac && <Wind className="w-3 h-3 text-blue-600" />}
                                {room.wifi && <Wifi className="w-3 h-3 text-blue-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* STEP 3 - DOCUMENTS */}
{bookingStep === 3 && (
  <div className="space-y-3">
    <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
      <FileText className="w-4 h-4 text-blue-600" />
      <h3 className="text-sm font-bold text-gray-900">Required Documents</h3>
    </div>

    <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg">
      <AlertCircle className="h-3.5 w-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
      <p className="text-[10px] text-blue-600">Max 10MB per file · PDF, JPG, PNG, WebP</p>
    </div>

    {/* Primary Tenant Documents */}
    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50/30">
      <div className="flex items-center gap-1.5 mb-2">
        <User className="h-3.5 w-3.5 text-blue-600" />
        <h4 className="text-xs font-semibold text-gray-800">Primary Tenant Documents</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* ID Proof */}
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold">ID Proof Type *</Label>
          <Select 
            value={documentDetails.idProofType} 
            onValueChange={(v) => setDocumentDetails(prev => ({ ...prev, idProofType: v }))}
          >
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue placeholder="Select ID type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
              <SelectItem value="Passport">Passport</SelectItem>
              <SelectItem value="PAN Card">PAN Card</SelectItem>
              <SelectItem value="Driving Licence">Driving Licence</SelectItem>
              <SelectItem value="Voter ID">Voter ID</SelectItem>
            </SelectContent>
          </Select>

          {documentDetails.idProofType && (
            <div className="mt-1">
              <Label className="text-[10px] font-semibold">ID Proof Number *</Label>
              <Input
                value={documentDetails.idProofNumber}
                onChange={(e) => setDocumentDetails(prev => ({ ...prev, idProofNumber: e.target.value }))}
                placeholder="Document number"
                className="h-7 text-[10px]"
                required
              />
            </div>
          )}

          <div className="mt-1">
            <Label className="text-[10px] font-semibold">Upload ID Proof *</Label>
            <div className="flex items-center gap-2 mt-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => idProofInputRef.current?.click()}
                className="h-7 text-[10px]"
              >
                <Upload className="h-3 w-3 mr-1" />
                {documentDetails.idProofFile ? 'Change File' : 'Upload'}
              </Button>
              {documentDetails.idProofFile && (
                <span className="text-[9px] text-green-600 truncate">
                  {documentDetails.idProofFile.name}
                </span>
              )}
              <input
                type="file"
                ref={idProofInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                // For ID Proof file upload
onChange={(e) => {
  if (e.target.files?.[0]) {
    if (e.target.files[0].size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB");
      return;
    }
    setDocumentDetails(prev => ({ ...prev, idProofFile: e.target.files![0] }));
  }
}}
              />
            </div>
          </div>
        </div>

        {/* Address Proof */}
        <div className="space-y-1">
          <Label className="text-[10px] font-semibold">Address Proof Type *</Label>
          <Select 
            value={documentDetails.addressProofType} 
            onValueChange={(v) => setDocumentDetails(prev => ({ ...prev, addressProofType: v }))}
          >
            <SelectTrigger className="h-7 text-[10px]">
              <SelectValue placeholder="Select address proof type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
              <SelectItem value="Utility Bill">Utility Bill</SelectItem>
              <SelectItem value="Bank Statement">Bank Statement</SelectItem>
              <SelectItem value="Passport">Passport</SelectItem>
              <SelectItem value="Voter ID">Voter ID</SelectItem>
            </SelectContent>
          </Select>

          {documentDetails.addressProofType && (
            <div className="mt-1">
              <Label className="text-[10px] font-semibold">Address Proof Number *</Label>
              <Input
                value={documentDetails.addressProofNumber}
                onChange={(e) => setDocumentDetails(prev => ({ ...prev, addressProofNumber: e.target.value }))}
                placeholder="Document number"
                className="h-7 text-[10px]"
                required
              />
            </div>
          )}

          <div className="mt-1">
            <Label className="text-[10px] font-semibold">Upload Address Proof *</Label>
            <div className="flex items-center gap-2 mt-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addressProofInputRef.current?.click()}
                className="h-7 text-[10px]"
              >
                <Upload className="h-3 w-3 mr-1" />
                {documentDetails.addressProofFile ? 'Change File' : 'Upload'}
              </Button>
              {documentDetails.addressProofFile && (
                <span className="text-[9px] text-green-600 truncate">
                  {documentDetails.addressProofFile.name}
                </span>
              )}
              <input
                type="file"
                ref={addressProofInputRef}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    if (e.target.files[0].size > 10 * 1024 * 1024) {
                      toast.error("File exceeds 10MB");
                      return;
                    }
                    setDocumentDetails(prev => ({ ...prev, addressProofFile: e.target.files![0] }));
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

{/* Partner Documents - Only show when isCouple is true */}
{formData.isCouple && (
  <div className="p-3 border-2 border-pink-200 rounded-lg bg-pink-50/30">
    <div className="flex items-center gap-1.5 mb-2">
      <Heart className="h-3.5 w-3.5 text-pink-600" />
      <h4 className="text-xs font-semibold text-pink-800">Partner Documents</h4>
      <Badge variant="outline" className="text-[9px] bg-pink-100 text-pink-700 border-pink-200">
        Required for couple booking
      </Badge>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Partner ID Proof */}
      <div className="space-y-1">
        <Label className="text-[10px] font-semibold">Partner ID Proof Type *</Label>
        <Select 
          value={documentDetails.partnerIdProofType} 
          onValueChange={(v) => setDocumentDetails(prev => ({ ...prev, partnerIdProofType: v }))}
        >
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select ID type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
            <SelectItem value="Passport">Passport</SelectItem>
            <SelectItem value="PAN Card">PAN Card</SelectItem>
            <SelectItem value="Driving Licence">Driving Licence</SelectItem>
            <SelectItem value="Voter ID">Voter ID</SelectItem>
          </SelectContent>
        </Select>

        {documentDetails.partnerIdProofType && (
          <div className="mt-1">
            <Label className="text-[10px] font-semibold">Partner ID Proof Number *</Label>
            <Input
              value={documentDetails.partnerIdProofNumber}
              onChange={(e) => setDocumentDetails(prev => ({ ...prev, partnerIdProofNumber: e.target.value }))}
              placeholder="Document number"
              className="h-7 text-[10px]"
            />
          </div>
        )}

        <div className="mt-1">
          <Label className="text-[10px] font-semibold">Upload Partner ID Proof *</Label>
          <div className="flex items-center gap-2 mt-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => partnerIdProofInputRef.current?.click()}
              className="h-7 text-[10px]"
            >
              <Upload className="h-3 w-3 mr-1" />
              {documentDetails.partnerIdProofFile ? 'Change File' : 'Upload'}
            </Button>
            {documentDetails.partnerIdProofFile && (
              <span className="text-[9px] text-green-600 truncate">
                {documentDetails.partnerIdProofFile.name}
              </span>
            )}
            <input
              type="file"
              ref={partnerIdProofInputRef}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setDocumentDetails(prev => ({ ...prev, partnerIdProofFile: e.target.files![0] }));
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Partner Address Proof */}
      <div className="space-y-1">
        <Label className="text-[10px] font-semibold">Partner Address Proof Type *</Label>
        <Select 
          value={documentDetails.partnerAddressProofType} 
          onValueChange={(v) => setDocumentDetails(prev => ({ ...prev, partnerAddressProofType: v }))}
        >
          <SelectTrigger className="h-7 text-[10px]">
            <SelectValue placeholder="Select address proof type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Aadhar Card">Aadhar Card</SelectItem>
            <SelectItem value="Utility Bill">Utility Bill</SelectItem>
            <SelectItem value="Bank Statement">Bank Statement</SelectItem>
            <SelectItem value="Passport">Passport</SelectItem>
            <SelectItem value="Voter ID">Voter ID</SelectItem>
          </SelectContent>
        </Select>

        {documentDetails.partnerAddressProofType && (
          <div className="mt-1">
            <Label className="text-[10px] font-semibold">Partner Address Proof Number *</Label>
            <Input
              value={documentDetails.partnerAddressProofNumber}
              onChange={(e) => setDocumentDetails(prev => ({ ...prev, partnerAddressProofNumber: e.target.value }))}
              placeholder="Document number"
              className="h-7 text-[10px]"
            />
          </div>
        )}

        <div className="mt-1">
          <Label className="text-[10px] font-semibold">Upload Partner Address Proof *</Label>
          <div className="flex items-center gap-2 mt-0.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => partnerAddressProofInputRef.current?.click()}
              className="h-7 text-[10px]"
            >
              <Upload className="h-3 w-3 mr-1" />
              {documentDetails.partnerAddressProofFile ? 'Change File' : 'Upload'}
            </Button>
            {documentDetails.partnerAddressProofFile && (
              <span className="text-[9px] text-green-600 truncate">
                {documentDetails.partnerAddressProofFile.name}
              </span>
            )}
            <input
              type="file"
              ref={partnerAddressProofInputRef}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setDocumentDetails(prev => ({ ...prev, partnerAddressProofFile: e.target.files![0] }));
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
)}
  </div>
)}

{/* STEP 4 - PAYMENT */}
{bookingStep === 4 && selectedRoom && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Left Column - Payment Form */}
    <div className="lg:col-span-2 space-y-3">
      <div className="flex items-center gap-1.5 pb-1.5 border-b-2 border-gray-200">
        <CreditCard className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-gray-900">Payment</h3>
      </div>

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
              {formData.email} • +91 {formData.phone} • {formData.gender} {formData.isCouple ? '(Couple)' : ''}
            </p>
          </div>
        </div>
      </div>

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

      {/* Offer Code Section */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Have an Offer Code?
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
              <Ticket className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={offerCode}
              onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
              placeholder="Enter offer code"
              className="w-full pl-8 pr-3 py-2 text-xs border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
              disabled={!!appliedOffer}
            />
          </div>
          
          {!appliedOffer ? (
            <button
              type="button"
              onClick={() => validateAndApplyOffer(offerCode)}
              disabled={offerLoading || !offerCode}
              className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {offerLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAppliedOffer(null);
                setOfferCode('');
                setDiscountedAmount(0);
                setOfferError('');
                setOfferSuccess('');
                localStorage.removeItem('pendingOfferCode');
                localStorage.removeItem('pendingOfferData');
                toast.info('Offer code removed');
              }}
              className="px-3 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
        
        {offerError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <p className="text-[10px] text-red-700">{offerError}</p>
          </div>
        )}
        
        {offerSuccess && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
            <p className="text-[10px] text-green-700">{offerSuccess}</p>
          </div>
        )}
      </div>

      {/* Booking Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-xs font-bold text-gray-900 mb-2.5 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          Booking Summary
        </h4>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] sm:text-xs text-gray-700">
              Room {selectedRoom?.room_number} • Bed {selectedBed?.bedNumber}
            </span>
            <span className="text-xs font-bold text-gray-900">
              ₹{selectedBed?.bedRent.toLocaleString()}
              {bookingType === 'long' && <span className="text-[9px] text-gray-500 ml-0.5">/month</span>}
              {bookingType === 'short' && <span className="text-[9px] text-gray-500 ml-0.5">/day</span>}
            </span>
          </div>

          {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
            <div className="flex justify-between items-center text-[9px] text-gray-600">
              <span>Duration</span>
              <span>
                {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
          )}


          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] sm:text-xs text-gray-700">
              {bookingType === 'long' ? 'Monthly Rent' : 'Total Rent'}
            </span>
            <span className="text-xs font-bold text-gray-900">
              ₹{calculateTotal().toLocaleString()}
            </span>
          </div>

          {bookingType === 'long' && (
            <div className="flex justify-between items-center pt-1 border-t border-blue-200">
              <span className="text-[10px] sm:text-xs text-gray-700">Security Deposit</span>
              <span className="text-xs font-bold text-gray-900">
                ₹{(propertyData?.securityDeposit || 0).toLocaleString()}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-blue-200">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">Subtotal</span>
            <span className="text-xs font-bold text-gray-900">₹{calculateTotalPayable().toLocaleString()}</span>
          </div>

          {appliedOffer && discountedAmount > 0 && (
            <div className="flex justify-between items-center pt-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] sm:text-xs text-green-600">Discount</span>
                <Badge className="bg-green-100 text-green-800 text-[8px] px-1.5">
                  {appliedOffer.discount_type === 'percentage' 
                    ? `${appliedOffer.discount_percent}% OFF` 
                    : `₹${appliedOffer.discount_value} OFF`}
                </Badge>
              </div>
              <span className="text-xs font-bold text-green-600">- ₹{discountedAmount.toLocaleString()}</span>
            </div>
          )}

          <div className="border-t-2 border-blue-300 pt-2.5 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Total Payable
              </span>
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                ₹{calculateFinalAmount().toLocaleString()}
              </span>
            </div>
            
            {appliedOffer && discountedAmount > 0 && (
              <div className="flex justify-end items-center mt-1">
                <span className="text-[9px] text-gray-400 line-through">
                  ₹{calculateTotalPayable().toLocaleString()}
                </span>
                <span className="text-[9px] text-green-600 ml-1.5">
                  Save ₹{discountedAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 p-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100">
        <input
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={(e) => {
            handleInputChange('agreeToTerms', e.target.checked);
            e.preventDefault();
            fetchPaymentTerms();
            setShowTermsModal(true);
          }}
          className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-600 flex-shrink-0"
          required
        />
        <div className="text-[10px] text-gray-700">
          I agree to{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              fetchPaymentTerms();
              setShowTermsModal(true);
            }}
            className="text-blue-600 font-semibold hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-600 transition-all"
          >
            terms & conditions
          </button>
          , cancellation policy, and house rules.
        </div>
      </label>
    </div>

    {/* Right Column - Available Offers */}
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-2.5 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1 rounded-lg">
                <Ticket className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-xs">Available Offers</h3>
                <p className="text-[9px] text-gray-500">
                  {loadingOffers ? 'Loading...' : `${availableOffers.length} offer${availableOffers.length !== 1 ? 's' : ''} available`}
                </p>
              </div>
            </div>
            {appliedOffer && (
              <Badge className="bg-green-100 text-green-700 text-[8px]">
                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                1 Applied
              </Badge>
            )}
          </div>
        </div>

        {/* Offers List */}
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {loadingOffers ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-[10px] text-gray-500">Loading offers...</p>
            </div>
          ) : availableOffers.length === 0 ? (
            <div className="text-center py-6">
              <Tag className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
              <p className="text-[10px] text-gray-500">No offers available</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Check back later for deals</p>
            </div>
          ) : (
            availableOffers.map((offer) => {
              const isApplied = appliedOffer?.id === offer.id;
               const isRoomBooked = offer.room_id && bookedRoomIds.has(offer.room_id);
              const discountDisplay = offer.discount_type === 'percentage' 
                ? `${offer.discount_percent}% OFF`
                : `₹${offer.discount_value?.toLocaleString()} OFF`;
              
              return (
                <div 
                  key={offer.id} 
      className={`p-3 transition-all ${
        isApplied ? 'bg-green-50 border-l-2 border-l-green-500' : 
        isRoomBooked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
      }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-gray-900 truncate">
                          {offer.title}
                        </h4>
                        <Badge className="bg-yellow-100 text-yellow-700 text-[8px] font-semibold">
                          {discountDisplay}
                        </Badge>
                        {offer.min_months && offer.min_months > 0 && (
                          <Badge variant="outline" className="text-[7px]">
                            Min {offer.min_months}M
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-2">
                        {offer.description || `Get ${discountDisplay} on your booking`}
                      </p>

                       {/* Show "Fully Booked" badge if room is taken */}
          {isRoomBooked && (
            <div className="mt-1">
              <Badge className="bg-red-100 text-red-600 text-[7px]">
                <XCircle className="w-2 h-2 mr-0.5" />
                Room Fully Booked
              </Badge>
            </div>
          )}
                      
                      {/* Validity */}
                      {offer.end_date && (
                        <div className="flex items-center gap-0.5 mt-1">
                          <Clock className="w-2 h-2 text-gray-400" />
                          <span className="text-[8px] text-gray-400">
                            Valid till {new Date(offer.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      )}
                      
                      {/* Room Specific Badge */}
                      {offer.room_id && (
                        <div className="mt-1">
                          <Badge className="bg-blue-100 text-blue-600 text-[7px]">
                            <Building className="w-2 h-2 mr-0.5" />
                            Room specific offer
                          </Badge>
                        </div>
                      )}
                      
                      {/* Bonus Section */}
                      {offer.bonus_title && (
                        <div className="mt-1.5 pt-1 border-t border-dashed border-gray-200">
                          <div className="flex items-center gap-0.5">
                            <Gift className="w-2.5 h-2.5 text-orange-500" />
                            <span className="text-[8px] font-semibold text-orange-600">
                              Bonus: {offer.bonus_title}
                            </span>
                          </div>
                        </div>
                      )}



                    </div>
                    
                    {/* Action Button */}
                    {isApplied ? (
                      <button
                        onClick={() => {
                          setAppliedOffer(null);
                          setOfferCode('');
                          setDiscountedAmount(0);
                          setOfferError('');
                          setOfferSuccess('');
                          toast.info('Offer removed');
                        }}
                        className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 rounded text-[9px] font-medium hover:bg-red-100 transition-colors whitespace-nowrap"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => {

                          if (isRoomBooked) {
                toast.error('This offer is no longer available as the room is already booked');
                return;
              }
                          // Apply the offer
                          setAppliedOffer(offer);
                          setOfferCode(offer.code);
                          
                          // Calculate discount
                          const baseAmount = calculateTotalPayable();
                          let discountAmount = 0;
                          if (offer.discount_type === 'percentage' && offer.discount_percent) {
                            discountAmount = baseAmount * (offer.discount_percent / 100);
                          } else if (offer.discount_type === 'fixed' && offer.discount_value) {
                            discountAmount = offer.discount_value;
                          }
                          setDiscountedAmount(Math.min(discountAmount, baseAmount));
                          setOfferSuccess(`Offer applied! You save ₹${discountAmount.toLocaleString()}`);
                          setOfferError('');
                          toast.success(`Offer "${offer.title}" applied!`);
                        }}
                        // disabled={isRoomBooked}
            className={`ml-2 px-2 py-0.5 rounded text-[9px] font-medium transition-colors whitespace-nowrap ${
              isRoomBooked 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRoomBooked ? 'Unavailable' : 'Apply'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100">
          <p className="text-[8px] text-gray-400 text-center">
            Offers subject to terms & conditions
          </p>
        </div>
      </div>
    </div>
  </div>
)}
            </form>
          </div>

          {/* Footer Buttons - Fixed */}
<div className="flex gap-2 p-3 sm:p-4 border-t-2 border-gray-200 bg-white flex-shrink-0">
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
    form="booking-form"
    disabled={loading || (bookingStep === 2 && (roomsLoading || !selectedRoom))}
    className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow ${
      bookingStep === 4 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
    } disabled:opacity-50`}
    onClick={handleBookingSubmit}
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
    ) : bookingStep === 3 ? (
      <>
        Continue
        <ChevronRight className="w-4 h-4" />
      </>
    ) : (
      // Step 4 - Payment
      <>
        {paymentMethod === 'online' 
          ? `Pay ₹${calculateFinalAmount().toLocaleString()}`
          : `Confirm Booking ${appliedOffer ? `(Save ₹${discountedAmount.toLocaleString()})` : ''}`
        }
        <Check className="w-4 h-4" />
      </>
    )}
  </button>
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

      {/* Terms & Conditions Modal */}
{showTermsModal && (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
      
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 rounded-t-xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Payment Terms & Conditions</h3>
            <p className="text-[10px] text-blue-100">Please read carefully before proceeding</p>
          </div>
        </div>
        <button
          onClick={() => setShowTermsModal(false)}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* Modal Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loadingTerms ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-500">Loading terms & conditions...</p>
          </div>
        ) : (
          <>
            {/* Payment Methods Section */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-blue-800">Payment Methods</h4>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                We accept online payments via UPI, Credit/Debit Cards, and Net Banking. 
                Cash payments can be made at the property. All payments are processed securely.
              </p>
            </div>
            
            {/* Terms Content - Display exactly as stored in master */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-700" />
                <h4 className="text-xs font-bold text-gray-800">Terms & Conditions</h4>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-xs text-gray-700 leading-relaxed bg-transparent p-0 m-0">
                  {termsContent}
                </pre>
              </div>
            </div>
            
            
          </>
        )}
      </div>
      
      {/* Modal Footer */}
      <div className="flex-shrink-0 px-5 py-3 border-t bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-gray-500">
            By checking the box, you agree to all terms and conditions
          </p>
          <button
            onClick={() => setShowTermsModal(false)}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            I Agree
          </button>
        </div>
      </div>
      
    </div>
  </div>
)}
    </>
  );
});

export default BookingModal;