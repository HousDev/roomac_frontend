"use client";

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Home, Link as LinkIcon, PhoneCall, Mail as MailIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/use-settings';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';

export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="bg-blue-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              {settings.logo_footer ? (
                <img
                  // src={settings.logo_footer}
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
            <div className="flex items-center gap-2 mb-2">
              <Home className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-yellow-400">About ROOMAC</h2>
            </div>
            <p className="text-sm text-white mb-4 leading-relaxed">
              {settings.site_tagline || 'Comfort, Care, and Quality Accommodation. Well-planned living spaces for professionals and students.'}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Facebook className="h-5 w-5 text-white" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-white" />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Linkedin className="h-5 w-5 text-white" />
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-lg text-yellow-400">Quick Links</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/properties" className="text-sm text-white hover:text-yellow-400 transition-colors">
                  Explore Properties
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-white hover:text-yellow-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white hover:text-yellow-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white hover:text-yellow-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/partner" className="text-sm text-white hover:text-yellow-400 transition-colors">
                  Partner With Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <PhoneCall className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-lg text-yellow-400">Contact Info</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-white">
                  {settings.contact_address || 'Hinjawadi, Pune, Maharashtra 411057'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href={`tel:${settings.contact_phone || '+919876543210'}`} className="text-sm text-white hover:text-yellow-400 transition-colors">
                  {settings.contact_phone || '+91 98765 43210'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <a href={`mailto:${settings.contact_email || 'info@roomac.com'}`} className="text-sm text-white hover:text-yellow-400 transition-colors">
                  {settings.contact_email || 'info@roomac.com'}
                </a>
              </li>
            </ul>
          </div>

           <div className="space-y-4">
            {/* Follow Us heading with icon */}
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-400">Follow Us</h3>
            </div>
            
            <p className="text-sm text-white">
              Connect with us on social media for updates and offers
            </p>
            
            <div className="flex gap-3 pt-2">
              {settings.facebook_url ? (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full  transition-colors flex items-center justify-center">
                  <Facebook className="h-6 w-6 text-yellow-400" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full  flex items-center justify-center">
                  <Facebook className="h-6 w-6 text-yellow-400" />
                </div>
              )}
              
              {settings.instagram_url ? (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-yellow-400" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-yellow-400" />
                </div>
              )}
              
              {settings.linkedin_url ? (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full  transition-colors flex items-center justify-center">
                  <Linkedin className="h-6 w-6 text-yellow-400" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <Linkedin className="h-6 w-6 text-yellow-400" />
                </div>
              )}
            </div>
          </div>
        </div>

      <div className="border-t border-blue-800 mt-8 pt-8">
  {/* First line */}
    <p className="text-sm text-center mb-3">
    <span className="text-yellow-400">© {new Date().getFullYear()} {settings.site_name || 'ROOMAC'} - </span>
    <span className="text-white">Premium Co-Living Spaces</span>
    <span className="text-white">. All Rights Reserved.</span>
  </p>

  {/* Second line - Terms & Conditions */}
  <p className="text-sm text-white text-center mb-3">
    <Link
      href={settings.privacy_url || '/privacy'}
      className="hover:text-yellow-400 transition-colors mx-2"
    >
      Privacy Policy
    </Link>
    | 
    <Link
      href={settings.terms_url || '/terms'}
      className="hover:text-yellow-400 transition-colors mx-2"
    >
      Terms & Conditions
    </Link>
  </p>

  {/* Third line - Policies */}
  {/* <p className="text-sm text-white text-center mb-3">
    Minimum Stay: 3 Months | Security Deposit: 2 Months Rent | Rent Due: 1st-5th of Month
  </p> */}

  {/* Fourth line */}
  <p className="text-sm text-white text-center">
    All Rights & Offers Reserved by {settings.site_name || 'ROOMAC'} Management
  </p>
</div>
      </div>
    </footer>
  );
}