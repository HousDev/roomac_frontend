"use client";

import React from 'react';
import {
  Shield, Lock, Eye, Database, Share2, Mail, Phone, Calendar,
  Globe, AlertCircle, Cookie, Trash2, ExternalLink,
  Edit, Clock, Building, Users, Home, Sparkles, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const PrivacyPage = () => {
  const primary = "#004AAD";
  const dark = "#FFC107";

  const handleBack = () => { window.location.href = '/'; };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden py-12 md:py-16 bg-gradient-to-r from-[#0A1F5C] via-[#123A9A] to-[#1E4ED8] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white opacity-20" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white opacity-10" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white transition-all mb-4 text-xs sm:text-sm"
            style={{ background: `${primary}20` }}
          >
            <ArrowLeft size={14} /> <span>Back to Website</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: `${primary}20` }}>
              <Shield size={22} style={{ color: primary }} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Privacy Policy</h1>
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
                { id: 'collect', label: 'Collect', icon: Database },
                { id: 'use', label: 'Use', icon: Eye },
                { id: 'sharing', label: 'Sharing', icon: Share2 },
                { id: 'cookies', label: 'Cookies', icon: Cookie },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'rights', label: 'Rights', icon: Users },
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
                    { id: 'mission', label: '2. Our Mission & Vision', icon: Sparkles },
                    { id: 'collect', label: '3. Information We Collect', icon: Database },
                    { id: 'use', label: '4. How We Use Your Info', icon: Eye },
                    { id: 'sharing', label: '5. Information Sharing', icon: Share2 },
                    { id: 'cookies', label: '6. Cookies & Tracking', icon: Cookie },
                    { id: 'security', label: '7. Data Security', icon: Lock },
                    { id: 'rights', label: '8. Your Rights', icon: Users },
                    { id: 'contact', label: '9. Contact Us', icon: Mail },
                    { id: 'consent', label: '10. Consent', icon: CheckCircle },
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
                <p className="text-[10px] mb-3 text-gray-500">Questions about privacy?</p>
                <a href="mailto:privacy@roomac.in"
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
                  At <a href="https://roomac.in" target="_blank" rel="noopener noreferrer" className="font-semibold" style={{ color: primary }}>roomac.in</a>, we are committed to protecting your privacy in accordance with Indian laws. This policy explains how we handle your information as part of our co-living and PG management services.
                </p>
              </div>
            </div>

            {/* 2. Our Mission & Vision */}
            <div id="mission" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Sparkles size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>2. Our Mission & Vision</h2></div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold" style={{ color: dark }}>Mission</p>
                  <p className="text-[13px] text-gray-600">To provide premium, affordable co-living spaces that combine comfort, community, and convenience for young professionals and students.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: dark }}>Vision</p>
                  <p className="text-[13px] text-gray-600">To become India's most trusted co-living brand, known for exceptional quality, transparent prices, and resident satisfaction.</p>
                </div>
                <p className="text-[13px] text-gray-600">We leverage technology, maintain high standards, and listen to our residents to continuously improve and innovate our services.</p>
              </div>
            </div>

            {/* 3. Information We Collect */}
            <div id="collect" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Database size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>3. Information We Collect</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">To manage your stay and provide our services, we may collect:</p>
                <ul className="mt-3 space-y-2">
                  {['Full name', 'Email address', 'Phone number', 'Government ID (Aadhar/PAN)', 'Address details', 'Payment information', 'Emergency contact'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <CheckCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. How We Use Your Info */}
            <div id="use" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Eye size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>4. How We Use Your Information</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['Process room bookings and payments', 'Verify your identity and background', 'Communicate stay updates and notices', 'Respond to maintenance requests and complaints', 'Send promotional offers (with your consent)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <CheckCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Sharing */}
            <div id="sharing" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Share2 size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>5. Information Sharing</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">We may share your data with:</p>
                <ul className="mt-3 space-y-2">
                  {['Property owners and partners', 'Payment gateways and banks', 'Service providers (housekeeping, maintenance)', 'Legal authorities if required by law'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <AlertCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] text-gray-500 mt-3">We never sell or rent your personal information.</p>
              </div>
            </div>

            {/* 6. Cookies */}
            <div id="cookies" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Cookie size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>6. Cookies & Tracking</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">We use cookies to enhance user experience, remember preferences, and analyze website traffic. You can disable cookies in your browser settings.</p>
              </div>
            </div>

            {/* 7. Security */}
            <div id="security" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Lock size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>7. Data Security</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">We implement encryption, secure servers, and access controls to protect your information. However, no system is 100% secure.</p>
              </div>
            </div>

            {/* 8. Rights */}
            <div id="rights" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Users size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>8. Your Rights</h2></div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {['Access your personal data', 'Request correction of inaccurate data', 'Request deletion of your data', 'Withdraw consent at any time'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-gray-600">
                      <CheckCircle size={12} style={{ color: primary }} className="mt-0.5 flex-shrink-0" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 9. Contact */}
            <div id="contact" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><Mail size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>9. Contact Us</h2></div>
              </div>
              <div className="p-4 space-y-2 text-[12px] text-gray-600">
                <div className="flex items-center gap-2"><Mail size={14} style={{ color: primary }} /><span>privacy@roomac.in</span></div>
                <div className="flex items-center gap-2"><Phone size={14} style={{ color: primary }} /><span>+91 99239 53933</span></div>
                <div className="flex items-center gap-2"><Building size={14} style={{ color: primary }} /><span>ROOMAC – Co-living Spaces</span></div>
              </div>
            </div>

            {/* 10. Consent */}
            <div id="consent" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: "#e2e8f0" }}>
              <div className="px-4 py-3 border-b" style={{ background: `${dark}05`, borderColor: "#e2e8f0" }}>
                <div className="flex items-center gap-2"><CheckCircle size={16} style={{ color: primary }} /><h2 className="text-sm font-semibold" style={{ color: dark }}>10. Consent</h2></div>
              </div>
              <div className="p-4">
                <p className="text-[13px] text-gray-600">By using roomac.in, you acknowledge that you have read and agreed to this Privacy Policy.</p>
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

// Helpers (Info icon)
const Info = ({ size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const CheckCircle = ({ size = 16, style = {}, className = '', ...rest }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className} {...rest}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export default PrivacyPage;