import { useState } from 'react';
import { X, Check, Tag, CreditCard, Users, Calendar, User, Mail, Phone, Gift, FileText, Share2 } from 'lucide-react';
import { Room, PricingPlan } from '@/types/property';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  plans: PricingPlan[];
  securityDeposit: number;
  propertyName: string;
}

const COUPON_CODES = {
  'FIRST20': { discount: 20, type: 'percentage' as const, description: '20% off first month' },
  'SAVE500': { discount: 500, type: 'fixed' as const, description: '₹500 off' },
  'WELCOME10': { discount: 10, type: 'percentage' as const, description: '10% off' }
};

export function BookingModal({ isOpen, onClose, rooms, plans, securityDeposit, propertyName }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: '' as 'male' | 'female' | '',
    moveInDate: '',
    sharingType: 0,
    roomId: '',
    planId: '',
    couponCode: '',
    agreeToTerms: false
  });
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const sharingTypes = Array.from(new Set(rooms.map(r => r.sharingType))).sort((a, b) => a - b);
  const filteredRooms = formData.sharingType && formData.gender
    ? rooms.filter(r => r.sharingType === formData.sharingType && r.gender === formData.gender && r.available > 0)
    : [];

  const selectedRoom = rooms.find(r => r.id === formData.roomId);
  const selectedPlan = plans.find(p => p.id === formData.planId);

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    let total = selectedPlan.price;

    if (couponApplied && formData.couponCode) {
      const coupon = COUPON_CODES[formData.couponCode as keyof typeof COUPON_CODES];
      if (coupon) {
        if (coupon.type === 'percentage') {
          total -= (total * coupon.discount) / 100;
        } else {
          total -= coupon.discount;
        }
      }
    }

    return total;
  };

  const getDiscount = () => {
    if (!selectedPlan || !couponApplied || !formData.couponCode) return 0;
    return selectedPlan.price - calculateTotal();
  };

  const applyCoupon = () => {
    const coupon = COUPON_CODES[formData.couponCode as keyof typeof COUPON_CODES];
    if (coupon) {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (!formData.agreeToTerms) {
        alert('Please agree to terms and conditions');
        return;
      }
      alert(`Booking confirmed!\n\nName: ${formData.fullName}\nGender: ${formData.gender}\nRoom: ${selectedRoom?.name}\nPlan: ${selectedPlan?.name}\nTotal: ₹${(calculateTotal() + securityDeposit).toLocaleString()}\n\nPayment gateway would be integrated here.`);
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        moveInDate: '',
        sharingType: 0,
        roomId: '',
        planId: '',
        couponCode: '',
        agreeToTerms: false
      });
      setCouponApplied(false);
      setCouponError('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn">
        <div className="sticky top-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold">Book Your Stay</h2>
            <p className="text-violet-100 text-sm mt-1">{propertyName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              {[
                { num: 1, label: 'Info' },
                { num: 2, label: 'Selection' },
                { num: 3, label: 'Room' },
                { num: 4, label: 'Payment' }
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        step >= s.num
                          ? 'bg-violet-600 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${step >= s.num ? 'text-violet-600' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all ${
                        step > s.num ? 'bg-violet-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Personal Information</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2 text-violet-600" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2 text-violet-600" />
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-2 text-violet-600" />
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2 text-violet-600" />
                      Gender *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.gender === 'male'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={formData.gender === 'male'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male', roomId: '', sharingType: 0 })}
                          className="sr-only"
                          required
                        />
                        <span className="text-2xl">♂</span>
                        <span className="font-bold text-gray-900">Male</span>
                      </label>
                      <label
                        className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.gender === 'female'
                            ? 'border-pink-600 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={formData.gender === 'female'}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'female', roomId: '', sharingType: 0 })}
                          className="sr-only"
                          required
                        />
                        <span className="text-2xl">♀</span>
                        <span className="font-bold text-gray-900">Female</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2 text-violet-600" />
                      Move-in Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.moveInDate}
                      onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    <Users className="w-5 h-5 inline mr-2 text-violet-600" />
                    Select Sharing Type
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {sharingTypes.map((type) => {
                      const typeRooms = rooms.filter(r => r.sharingType === type && r.gender === formData.gender && r.available > 0);
                      const available = typeRooms.reduce((acc, r) => acc + r.available, 0);
                      const price = typeRooms[0]?.price || 0;

                      return (
                        <label
                          key={type}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all text-center ${
                            formData.sharingType === type
                              ? 'border-violet-600 bg-violet-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          } ${available === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="radio"
                            name="sharingType"
                            value={type}
                            checked={formData.sharingType === type}
                            onChange={(e) => setFormData({ ...formData, sharingType: Number(e.target.value), roomId: '' })}
                            className="sr-only"
                            required
                            disabled={available === 0}
                          />
                          <div className="text-3xl font-black gradient-text mb-1">{type}</div>
                          <div className="text-xs text-gray-600 font-semibold mb-2">Sharing</div>
                          <div className="text-sm font-black text-gray-900">₹{price.toLocaleString()}</div>
                          <div className="text-xs text-emerald-600 font-bold mt-1">{available} beds</div>
                        </label>
                      );
                    })}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your Plan</h3>
                    <div className="grid gap-3">
                      {plans.map((plan) => (
                        <label
                          key={plan.id}
                          className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.planId === plan.id
                              ? 'border-violet-600 bg-violet-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {plan.recommended && (
                            <span className="absolute -top-2 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              Popular
                            </span>
                          )}
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="plan"
                              value={plan.id}
                              checked={formData.planId === plan.id}
                              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                              className="w-5 h-5 text-violet-600"
                              required
                            />
                            <div className="ml-4 flex-1 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-lg text-gray-900">{plan.name}</p>
                                <p className="text-sm text-gray-600">All-inclusive</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-2xl text-gray-900">₹{plan.price.toLocaleString()}</p>
                                <p className="text-xs text-gray-600">/{plan.duration}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Select Your Room
                  </h3>
                  {filteredRooms.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <p className="text-gray-600 font-semibold">No rooms available for selected criteria</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredRooms.map((room) => (
                        <label
                          key={room.id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.roomId === room.id
                              ? 'border-violet-600 bg-violet-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="room"
                            value={room.id}
                            checked={formData.roomId === room.id}
                            onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                            className="sr-only"
                            required
                          />
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-900">{room.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              room.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                            }`}>
                              {room.gender === 'male' ? '♂' : '♀'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div>Floor {room.floor} • Occupied: {room.gender === 'male' ? room.occupancy.male : room.occupancy.female}/{room.sharingType}</div>
                            <div className="font-bold text-emerald-600">{room.available} bed(s) available</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 animate-fadeIn">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    <CreditCard className="w-5 h-5 inline mr-2 text-violet-600" />
                    Payment Summary
                  </h3>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 space-y-3 border border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Room:</span>
                      <span className="font-bold text-gray-900">{selectedRoom?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Plan:</span>
                      <span className="font-bold text-gray-900">{selectedPlan?.name}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Monthly Rent:</span>
                        <span className="font-semibold">₹{selectedPlan?.price.toLocaleString()}</span>
                      </div>
                      {couponApplied && getDiscount() > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span className="font-bold">-₹{getDiscount().toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Security Deposit:</span>
                        <span className="font-semibold">₹{securityDeposit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-2xl text-violet-600">₹{(calculateTotal() + securityDeposit).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 inline mr-2 text-violet-600" />
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.couponCode}
                        onChange={(e) => {
                          setFormData({ ...formData, couponCode: e.target.value.toUpperCase() });
                          setCouponError('');
                          setCouponApplied(false);
                        }}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent transition-all uppercase"
                        placeholder="Enter code"
                        disabled={couponApplied}
                      />
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={!formData.couponCode || couponApplied}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                      >
                        {couponApplied ? '✓' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
                    {couponApplied && <p className="text-xs text-green-600 mt-1 font-medium">Coupon applied!</p>}
                  </div>

                  <label className="flex items-start gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                      className="w-5 h-5 text-violet-600 mt-0.5"
                      required
                    />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Terms & Conditions *
                      </p>
                      <p className="text-gray-700">
                        I agree to the terms and conditions, including 3-month lock-in period, refund policy, and house rules.
                      </p>
                    </div>
                  </label>

                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-4 text-white">
                    <p className="font-bold mb-1">🔒 Secure Payment</p>
                    <p className="text-sm text-violet-100">
                      Pay via UPI, Card, Net Banking, or Wallets
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-5 border-t-2 border-gray-200">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  {step === 4 ? '🔒 Confirm & Pay' : 'Continue →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
