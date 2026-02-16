"use client";

import { X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrivacyPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

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
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Privacy Policy</h2>
          </div>
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
            <p className="font-semibold text-slate-900">At <a href="https://roomac.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">roomac.in</a>, we are committed to protecting your privacy in accordance with Indian laws and regulations. This policy outlines how we handle your information.</p>
            
            <h3 className="font-semibold text-slate-900 mt-4">1. Collection of Personal Information</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>We may collect personal information including names, email addresses, phone numbers, government ID (Aadhar/PAN), address details, and payment information provided voluntarily during booking.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">2. Use of Personal Information</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>The collected data helps us process bookings, verify identity, communicate updates about your stay, respond to inquiries, and send promotional offers with your consent.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">3. Information Sharing</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>We may share data with trusted property partners, payment processors, and service providers. We never sell or rent your personal information without your consent.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">4. Data Security</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>We implement appropriate technical and organizational measures to protect your information in accordance with Indian data protection laws, including encryption and secure servers.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">5. Cookies and Tracking Technologies</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cookies may be used to enhance user experience, remember preferences, and analyze website traffic to improve our services.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">6. Third-Party Websites</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our website may contain external links to payment gateways or partner sites. We are not responsible for their privacy practices.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">7. Children's Privacy</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Our services are intended for individuals 18 years and above. We do not knowingly collect data from minors.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">8. Changes to this Policy</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>We may update this Privacy Policy periodically. Users are encouraged to review it regularly.</li>
            </ul>

            <h3 className="font-semibold text-slate-900 mt-4">9. Contact Us</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>For questions or concerns regarding your privacy, email us at <a href="mailto:privacy@roomac.in" className="text-primary hover:underline">privacy@roomac.in</a> or call <a href="tel:+919923953933" className="text-primary hover:underline">+91 99239 53933</a>.</li>
            </ul>

            <p className="font-semibold text-slate-900 mt-4">By using <a href="https://roomac.in" target="_blank" className="text-primary hover:underline">roomac.in</a>, you acknowledge that you have read, understood, and agreed to this Privacy Policy under the laws of India.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            close
          </Button>
        </div>
      </div>
    </div>
  );
}