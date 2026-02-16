"use client";

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/use-settings';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';
import { FaWhatsapp } from 'react-icons/fa';
import { TermsPopup } from '@/components/layout/TermsPopup';
import { PrivacyPopup } from '@/components/layout/Privacy'; // Import Privacy Popup

export function Footer() {
  const { settings } = useSettings();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false); // State for Privacy Popup
  
  return (
    <>
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                {settings.logo_footer ? (
                  <img
                    src={settings.logo_footer}
                    alt={settings.site_name || 'ROOMAC'}
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <img
                    src={roomacLogo}
                    alt={settings.site_name || 'ROOMAC'}
                    className="h-12 w-auto object-contain"
                  />
                )}
              </div>
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {'Premium co-living spaces providing comfort, care, and quality accommodation for professionals and students in Pune.'}
                <br/>
                <br/>
                <span className='font-bold'>Quality Living, Affordable Prices</span>
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/properties" className="text-sm text-slate-300 hover:text-primary transition-colors">
                    Explore Properties
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-sm text-slate-300 hover:text-primary transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-slate-300 hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-slate-300 hover:text-primary transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/partner" className="text-sm text-slate-300 hover:text-primary transition-colors">
                    Partner With Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    {settings.contact_address || 'Wakad, Pune, 411057'}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <a href={`tel:${settings.contact_phone || '+919876543210'}`} className="text-sm text-slate-300 hover:text-primary transition-colors">
                    {settings.contact_phone || '+91 99239 53933'}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <a href={`mailto:${settings.contact_email || 'info@roomac.com'}`} className="text-sm text-slate-300 hover:text-primary transition-colors">
                    {settings.contact_email || 'stay@roomac.in'}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
              <p className="text-sm text-slate-300 mb-4">
                Get updates on new properties and exclusive offers.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
                <Button size="sm" className="bg-primary hover:bg-primary/90 whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              
              {/* Social Media Icons */}
              <div className="flex gap-6 mt-4 ml-4">
                <a 
                  href="https://facebook.com/roomac" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors cursor-pointer" 
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6 text-blue-500" />
                </a>
                
                <a 
                  href="https://instagram.com/roomac_official" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors cursor-pointer" 
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6 text-blue-500" />
                </a>
                
                <a 
                  href="https://wa.me/919923953933"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors cursor-pointer" 
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp className="h-6 w-6 text-blue-500" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-2 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} {settings.site_name || 'Roomac Co-living'}. All rights reserved. | Developed by <span className="font-medium text-slate-300">
    {' '}Hously Finntech Realty
  </span>
          </p> 
        

            <div className="flex gap-6 mt-0">
              {/* Privacy Policy Button - Opens Popup */}
              <button
                onClick={() => setIsPrivacyOpen(true)}
                className="text-sm text-slate-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
              >
                Privacy Policy
              </button>

              {/* Terms & Conditions Button - Opens Popup */}
              <button
                onClick={() => setIsTermsOpen(true)}
                className="text-sm text-slate-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-none"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Popups */}
      <TermsPopup 
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
      
      <PrivacyPopup 
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </>
  );
}
