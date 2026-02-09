"use client";

import { useState, useCallback, memo } from 'react';
import {
  X, User, Phone, Mail, Users, Calendar, CreditCard, FileText,
  Check, ChevronRight, CalendarDays, IndianRupee
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: string;
  setBookingType: (type: string) => void;
  propertyData: any;
}

const COUPON_CODES = {
  'FIRST20': { discount: 20, type: 'percentage', description: '20% off first month' },
  'SAVE500': { discount: 500, type: 'fixed', description: '₹500 off' }
};

const BookingModal = memo(function BookingModal({ 
  isOpen, 
  onClose, 
  bookingType, 
  setBookingType,
  propertyData 
}: BookingModalProps) {
  const [bookingStep, setBookingStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    moveInDate: '',
    checkInDate: '',
    checkOutDate: '',
    guests: "1",
    sharingType: 0,
    roomId: '',
    planId: '',
    couponCode: '',
    agreeToTerms: false
  });

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const calculateTotal = useCallback(() => {
    if (bookingType === 'short') {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 0;

      const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      return days * (propertyData?.dailyRate || 500);
    }

    const selectedPlan = propertyData?.pricingPlans?.find((p: any) => p.id === formData.planId);
    if (!selectedPlan) return 0;
    let total = selectedPlan.price;
    if (couponApplied && formData.couponCode) {
      const coupon = (COUPON_CODES as any)[formData.couponCode];
      if (coupon) {
        total -= coupon.type === 'percentage' ? (total * coupon.discount) / 100 : coupon.discount;
      }
    }
    return total;
  }, [bookingType, formData, couponApplied, propertyData]);

  const applyCoupon = useCallback(() => {
    const coupon = (COUPON_CODES as any)[formData.couponCode];
    if (coupon) {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  }, [formData.couponCode]);

  const handleBookingSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingStep < 4) {
      setBookingStep(bookingStep + 1);
      return;
    }

    if (!formData.agreeToTerms) {
      alert('Please agree to terms and conditions');
      return;
    }

    setLoading(true);

    try {
      if (bookingType === 'long') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Booking request submitted for ${formData.fullName}. We'll contact you shortly!`);
      } else {
        const checkIn = new Date(formData.checkInDate);
        const checkOut = new Date(formData.checkOutDate);

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
          alert("Please select valid check-in and check-out dates.");
          setLoading(false);
          return;
        }

        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const dailyRate = propertyData?.dailyRate || 500;
        const total = days * dailyRate;
        const bookingNumber = "SSB" + Date.now();

        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`Short stay booking confirmed! Booking #${bookingNumber}\nTotal: ₹${total.toLocaleString()} for ${days} days\n\nWe'll contact you shortly to confirm.`);
      }

      onClose();
      setBookingStep(1);
      setFormData({
        fullName: '', email: '', phone: '', gender: '', moveInDate: '',
        checkInDate: '', checkOutDate: '', guests: "1",
        sharingType: 0, roomId: '', planId: '', couponCode: '', agreeToTerms: false
      });
      setCouponApplied(false);
      setCouponError('');

    } catch (err) {
      console.error("Error submitting booking:", err);
      alert("Error submitting booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [bookingStep, bookingType, formData, onClose, propertyData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl md:rounded-2xl w-full max-w-lg md:max-w-3xl max-h-[90vh] overflow-hidden shadow-xl md:shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-3 md:p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-sm md:text-2xl font-bold">
              {bookingType === 'long' ? 'Book Your Stay' : 'Book Short Stay'}
            </h2>
            <p className="text-violet-100 text-[10px] md:text-sm mt-0.5 md:mt-1">{propertyData.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 md:p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-4 h-4 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="px-3 md:px-6 pt-2 md:pt-4">
          <div className="flex bg-gray-100 rounded-lg md:rounded-xl p-0.5 md:p-1 mb-2 md:mb-4">
            <button
              onClick={() => setBookingType('long')}
              className={`flex-1 py-1.5 md:py-2.5 rounded md:rounded-lg font-bold text-xs md:text-sm transition-all ${bookingType === 'long'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Long Stay
            </button>
            <button
              onClick={() => setBookingType('short')}
              className={`flex-1 py-1.5 md:py-2.5 rounded md:rounded-lg font-bold text-xs md:text-sm transition-all ${bookingType === 'short'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Short Stay
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)] md:max-h-[calc(90vh-180px)]">
          <div className="p-3 md:p-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
              {[{ num: 1, label: 'Info' }, { num: 2, label: 'Select' }, { num: 3, label: 'Room' }, { num: 4, label: 'Payment' }].map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-7 h-7 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-xs md:text-base transition-all ${bookingStep >= s.num
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow md:shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                      }`}>
                      {bookingStep > s.num ? <Check className="w-3 h-3 md:w-6 md:h-6" /> : s.num}
                    </div>
                    <span className={`text-[10px] md:text-sm mt-0.5 md:mt-2 font-semibold ${bookingStep >= s.num ? 'text-violet-600' : 'text-gray-500'
                      }`}>{s.label}</span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 md:h-1 mx-0.5 md:mx-2 rounded transition-all ${bookingStep > s.num
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600'
                        : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 md:space-y-6">
              {/* Step 1: Personal Information */}
              {bookingStep === 1 && (
                <div className="space-y-3 md:space-y-5">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-2 md:mb-4">Personal Information</h3>
                  <div className="space-y-2 md:space-y-4">
                    <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
                          <User className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
                          <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                          placeholder="+91 XXXXX XXXXX"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
                        <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
                        <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Gender *
                      </label>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <label className={`flex items-center justify-center gap-1 md:gap-2 p-2 md:p-4 border rounded-lg md:rounded-xl cursor-pointer transition-all ${formData.gender === 'male'
                            ? 'border-blue-600 bg-blue-50 shadow-inner'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="sr-only"
                            required
                          />
                          <span className="text-xl md:text-2xl">♂</span>
                          <span className="font-bold text-gray-900 text-xs md:text-sm">Male</span>
                        </label>
                        <label className={`flex items-center justify-center gap-1 md:gap-2 p-2 md:p-4 border rounded-lg md:rounded-xl cursor-pointer transition-all ${formData.gender === 'female'
                            ? 'border-pink-600 bg-pink-50 shadow-inner'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}>
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="sr-only"
                            required
                          />
                          <span className="text-xl md:text-2xl">♀</span>
                          <span className="font-bold text-gray-900 text-xs md:text-sm">Female</span>
                        </label>
                      </div>
                    </div>

                    {bookingType === 'long' ? (
                      <div>
                        <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2 flex items-center">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-violet-600" />Move-in Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.moveInDate}
                          onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                        />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-2 md:gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Check-in *</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={formData.checkInDate}
                            onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Check-out *</label>
                          <input
                            type="date"
                            required
                            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                            value={formData.checkOutDate}
                            onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 md:border-2 rounded-lg md:rounded-xl focus:ring-1 md:focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Payment Summary */}
              {bookingStep === 4 && (
                <div className="space-y-3 md:space-y-5">
                  <h3 className="text-sm md:text-xl font-bold text-gray-900 mb-2 md:mb-4">
                    <CreditCard className="w-3 h-3 md:w-5 md:h-5 inline mr-1 md:mr-2 text-violet-600" />
                    Payment Summary
                  </h3>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-5 border border-gray-200">
                    <div className="space-y-1.5 md:space-y-3 mb-2 md:mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-semibold text-xs md:text-sm">
                          {bookingType === 'long' ? 'Monthly Rent' : 'Daily Rate'}
                        </span>
                        <span className="font-bold text-sm md:text-lg">
                          <IndianRupee className="w-3 h-3 md:w-4 md:h-4 inline" />
                          {calculateTotal().toLocaleString()}
                          {bookingType === 'short' && ' total'}
                        </span>
                      </div>

                      {/* {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
                        <div className="text-[10px] md:text-sm text-gray-600">
                          {Math.ceil((new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / (1000 * 60 * 60 * 24))} days
                          × ₹{propertyData.dailyRate}/day
                        </div>
                      )} */}
                      {bookingType === 'short' && formData.checkInDate && formData.checkOutDate && (
  <div className="text-[10px] md:text-sm text-gray-600">
    {Math.ceil(
      (new Date(formData.checkOutDate).getTime() - 
       new Date(formData.checkInDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    )} days
    × ₹{propertyData.dailyRate}/day
  </div>
)}


                      <div className="flex justify-between items-center pt-1.5 md:pt-3 border-t border-gray-300">
                        <span className="text-gray-700 font-semibold text-xs md:text-sm">Security Deposit</span>
                        <span className="font-bold text-xs md:text-base">
                          <IndianRupee className="w-3 h-3 md:w-4 md:h-4 inline" />
                          {propertyData.securityDeposit.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="border-t-2 border-gray-300 pt-2 md:pt-4 mt-2 md:mt-4 flex justify-between items-center">
                      <span className="font-bold text-sm md:text-lg">Total Amount:</span>
                      <span className="font-bold text-lg md:text-2xl text-violet-600">
                        <IndianRupee className="w-4 h-4 md:w-5 md:h-5 inline" />
                        {(calculateTotal() + propertyData.securityDeposit).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="bg-amber-50 border border-amber-200 md:border-2 rounded-lg md:rounded-xl p-2 md:p-4">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1 md:mb-2">Coupon Code</label>
                    <div className="flex gap-1 md:gap-2">
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) => handleInputChange('couponCode', e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 px-2 md:px-4 py-1.5 md:py-2 border border-gray-300 rounded md:rounded-lg text-sm"
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded md:rounded-lg font-bold hover:shadow md:hover:shadow-lg transition-all text-xs md:text-sm"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-[10px] md:text-xs mt-0.5 md:mt-1">{couponError}</p>}
                    {couponApplied && <p className="text-green-600 text-[10px] md:text-xs mt-0.5 md:mt-1">Coupon applied successfully!</p>}
                  </div>

                  {/* Terms Agreement */}
                  <label className="flex items-start gap-2 md:gap-3 p-2 md:p-4 bg-amber-50 border border-amber-200 md:border-2 rounded-lg md:rounded-xl cursor-pointer hover:border-amber-300 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="w-4 h-4 md:w-5 md:h-5 text-violet-600 mt-0.5"
                      required
                    />
                    <div className="text-xs md:text-sm">
                      <p className="font-bold text-gray-900 mb-0.5 md:mb-1 flex items-center">
                        <FileText className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />Terms & Conditions *
                      </p>
                      <p className="text-gray-700">I agree to the terms and conditions and understand all policies</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex gap-2 md:gap-3 pt-3 md:pt-6 border-t border-gray-200 md:border-t-2">
                {bookingStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setBookingStep(bookingStep - 1)}
                    className="flex-1 px-3 md:px-5 py-2 md:py-3 border border-gray-300 md:border-2 text-gray-700 rounded-lg md:rounded-xl font-bold hover:border-gray-400 transition-all text-xs md:text-sm"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 md:px-5 py-2 md:py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg md:rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed text-xs md:text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : bookingStep === 4 ? (
                    <span className="flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm">
                      🔒 Confirm & Pay ₹{(calculateTotal() + propertyData.securityDeposit).toLocaleString()}
                    </span>
                  ) : (
                    'Continue →'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BookingModal;