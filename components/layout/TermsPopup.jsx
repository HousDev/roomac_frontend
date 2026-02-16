"use client";

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TermsPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-900">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto max-h-[60vh] text-sm text-slate-600">
          <div className="space-y-4">
            <p className="font-semibold text-slate-900">Welcome to <a href="https://roomac.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">roomac.in</a>. By accessing or using our website and services, you agree to these Terms & Conditions.</p>
            
            <h3 className="font-semibold text-slate-900 mt-4">1. Booking and Payment</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Booking amounts are non-refundable once confirmed.</li>
              <li>Rent is payable monthly in advance by the 5th of each month.</li>
              <li>A security deposit equivalent to 2 months' rent is required at move-in.</li>
              <li>Payments can be made via UPI, net banking, or credit/debit cards.</li>
              <li>Late payment charges of ₹100 per day may apply after the due date.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">2. Occupancy Rules</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Only registered tenants are allowed to stay in the property.</li>
              <li>Visitors must be informed to the management and cannot stay overnight without prior approval.</li>
              <li>Smoking, alcohol, and non-vegetarian food are strictly prohibited in common areas.</li>
              <li>Quiet hours from 10:00 PM to 7:00 AM must be respected.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">3. Maintenance and Facilities</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Wi-Fi is provided for personal use only; misuse (gaming, heavy downloads) may result in restrictions.</li>
              <li>Electricity usage beyond the standard limit (if applicable) will be billed separately.</li>
              <li>Housekeeping services are provided as per the package selected.</li>
              <li>Any damage to property will be charged to the tenant.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">4. Check-out and Vacating</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>One month's notice is required before vacating the property.</li>
              <li>Security deposit will be refunded within 30 days after vacating, subject to deductions for damages or pending dues.</li>
              <li>Rooms must be handed over in the same condition as received (normal wear and tear excepted).</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">5. General Terms</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>We reserve the right to modify these terms at any time without prior notice.</li>
              <li>All disputes are subject to Pune jurisdiction only.</li>
              <li>For any complaints or concerns, contact us at <a href="mailto:stay@roomac.in" className="text-primary hover:underline">stay@roomac.in</a> or call <a href="tel:+919923953933" className="text-primary hover:underline">+91 99239 53933</a>.</li>
              <li>Visit our website: <a href="https://roomac.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.roomac.in</a></li>
            </ul>

            <p className="font-semibold text-slate-900 mt-4">By continuing to use our services, you acknowledge that you have read and agreed to these Terms & Conditions.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}