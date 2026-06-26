"use client";

import React from 'react';
import {
  FileText, Building, UserCheck, Users, Globe, Home, MessageCircle,
  Banknote, Briefcase, Link as LinkIcon, Shield, AlertTriangle,
  Handshake, Lock, Trash2, Edit, Scale, AlertOctagon, Mail, Phone,
  Calendar, ArrowLeft, Info, Sparkles, CheckCircle
} from 'lucide-react';

const TermsPage = () => {
  // Colors matching Privacy page
  const primary = "#004AAD";   // blue
  const dark = "#FFC107";      // yellow/orange

  const handleBack = () => { window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner – same gradient as Privacy */}
      <div className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white transition-all mb-4 text-xs sm:text-sm"
            style={{ background: `${primary}30` }}
          >
            <ArrowLeft size={14} /> <span>Back to Website</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: `${primary}30` }}>
              <FileText size={22} style={{ color: primary }} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Terms & Conditions</h1>
          </div>
          <p className="text-white/70 text-xs sm:text-sm max-w-2xl">
            ROOMAC – Comfort, Care, and Quality Accommodation
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-white/50 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1"><Calendar size={12} /><span>Effective: 24 June 2023</span></div>
            <div className="flex items-center gap-1"><Edit size={12} /><span>Last Updated: 2026</span></div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Mobile nav */}
          <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'intro', label: 'Intro', icon: Info },
                { id: 'mission', label: 'Our Mission', icon: Sparkles },
                { id: 'booking', label: 'Booking', icon: Calendar },
                { id: 'occupancy', label: 'Occupancy', icon: Users },
                { id: 'maintenance', label: 'Maintenance', icon: Building },
                { id: 'checkout', label: 'Check-out', icon: Trash2 },
                { id: 'general', label: 'General', icon: Scale },
                { id: 'contact', label: 'Contact', icon: Mail },
              ].map((item) => (
                <a key={item.id} href={`#${item.id}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all"
                  style={{ background: "#fff", border: "1px solid #e2e8f0", color: "#5a7184" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = primary; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#5a7184"; }}
                >
                  <item.icon size={10} /><span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e2e8f0" }}>
                <h3 className="text-xs font-semibold mb-3 pb-2 border-b" style={{ color: dark, borderColor: "#e2e8f0" }}>
                  On this page
                </h3>
                <nav className="space-y-1 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {[
                    { id: 'intro', label: '1. Introduction', icon: Info },
                    { id: 'mission', label: '2. Our Mission', icon: Sparkles },
                    { id: 'booking', label: '3. Booking & Payment', icon: Calendar },
                    { id: 'occupancy', label: '4. Occupancy Rules', icon: Users },
                    { id: 'maintenance', label: '5. Maintenance & Facilities', icon: Building },
                    { id: 'checkout', label: '6. Check-out & Vacating', icon: Trash2 },
                    { id: 'general', label: '7. General Terms', icon: Scale },
                    { id: 'contact', label: '8. Contact & Grievance', icon: Mail },
                    { id: 'consent', label: '9. Consent', icon: CheckCircle },
                  ].map((item) => (
                    <a key={item.id} href={`#${item.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-all hover:translate-x-0.5"
                      style={{ color: "#5a7184" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#5a7184"}
                    >
                      <item.icon size={12} style={{ color: primary }} />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: "#e2e8f0" }}>
                <h3 className="text-xs font-semibold mb-3" style={{ color: dark }}>Need Help?</h3>
                <p className="text-[10px] mb-3 text-gray-500">Questions about our terms?</p>
                <a href="mailto:stay@roomac.in"
                  className="w-full px-3 py-2 rounded-lg text-[10px] font-medium text-white text-center block transition-all hover:opacity-90"
                  style={{ background: primary }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">

            {/* 1. Introduction */}
            <div id="intro" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Info size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>1. Introduction</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed text-gray-600">
                  Welcome to <a href="https://roomac.in" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: primary }}>roomac.in</a>. By accessing or using our co-living and PG management services, you agree to these Terms & Conditions.
                </p>
              </div>
            </div>

            {/* 2. Our Mission */}
            <div id="mission" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Sparkles size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>2. Our Mission</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">
                  ROOMAC is dedicated to providing premium, affordable co-living spaces that combine comfort, community, and convenience for young professionals and students. We strive to create homes where you don't just live — you belong.
                </p>
              </div>
            </div>

            {/* 3. Booking & Payment */}
            <div id="booking" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Calendar size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>3. Booking & Payment</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['Booking amounts are non-refundable once confirmed.',
                    'Rent is payable monthly in advance by the 5th of each month.',
                    'A security deposit equivalent to 2 months\' rent is required at move-in.',
                    'Payments can be made via UPI, net banking, or credit/debit cards.',
                    'Late payment charges of ₹100 per day may apply after the due date.'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <CheckCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Occupancy Rules */}
            <div id="occupancy" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Users size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>4. Occupancy Rules</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['Only registered tenants are allowed to stay.',
                    'Visitors must be informed and cannot stay overnight without approval.',
                    'Smoking, alcohol, and non-veg food are prohibited in common areas.',
                    'Quiet hours from 10 PM to 7 AM must be respected.'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <AlertTriangle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Maintenance & Facilities */}
            <div id="maintenance" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Building size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>5. Maintenance & Facilities</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['Wi-Fi is for personal use only; misuse may result in restrictions.',
                    'Electricity usage beyond standard limit will be billed separately.',
                    'Housekeeping services as per selected package.',
                    'Any damage to property will be charged to the tenant.'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <AlertTriangle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 6. Check-out & Vacating */}
            <div id="checkout" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Trash2 size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>6. Check-out & Vacating</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['One month\'s notice is required before vacating.',
                    'Security deposit will be refunded within 30 days after vacating, subject to deductions for damages or dues.',
                    'Rooms must be handed over in same condition as received (normal wear & tear excepted).'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <CheckCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7. General Terms */}
            <div id="general" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Scale size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>7. General Terms</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['We reserve the right to modify these terms at any time.',
                    'All disputes are subject to Pune jurisdiction only.',
                    'For complaints, contact: stay@roomac.in or +91 99239 53933',
                    'Visit our website: www.roomac.in'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <AlertTriangle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 8. Contact & Grievance */}
            <div id="contact" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Mail size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>8. Contact & Grievance</h2></div>
              </div>
              <div className="p-4 space-y-2 text-[12px] text-gray-600">
                <div className="flex items-center gap-2"><Mail size={14} style={{ color: primary }} /><span>stay@roomac.in</span></div>
                <div className="flex items-center gap-2"><Phone size={14} style={{ color: primary }} /><span>+91 99239 53933</span></div>
                <div className="flex items-center gap-2"><Building size={14} style={{ color: primary }} /><span>ROOMAC – Co-living Spaces</span></div>
              </div>
            </div>

            {/* 9. Consent */}
            <div id="consent" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><CheckCircle size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>9. Consent</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">By using our services, you acknowledge that you have read and agreed to these Terms & Conditions.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t mt-6" style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-[9px] sm:text-[10px] text-center text-gray-500">
            © {new Date().getFullYear()} ROOMAC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;