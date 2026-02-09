"use client";

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/use-settings';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';


export function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="bg-slate-900 text-white">
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
      src={roomacLogo.src} // Yaha default logo use karein
      alt={settings.site_name || 'ROOMAC'}
      className="h-12 w-auto object-contain"
    />
  )}
                {/* <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold">R</span>
                  </div>
                  <span className="text-2xl font-bold">{settings.site_name || 'ROOMAC'}</span>
                </div> */}
              
            </div>
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              {settings.site_tagline || 'Comfort, Care, and Quality Accommodation. Well-planned living spaces for professionals and students.'}
            </p>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
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
                  {settings.contact_address || 'Hinjawadi, Pune, Maharashtra 411057'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={`tel:${settings.contact_phone || '+919876543210'}`} className="text-sm text-slate-300 hover:text-primary transition-colors">
                  {settings.contact_phone || '+91 98765 43210'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={`mailto:${settings.contact_email || 'info@roomac.com'}`} className="text-sm text-slate-300 hover:text-primary transition-colors">
                  {settings.contact_email || 'info@roomac.com'}
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
          </div>
        </div>

       <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
  <p className="text-sm text-slate-400">
    © {new Date().getFullYear()} {settings.site_name || 'Hously Finntech Realty'}. All rights reserved.
  </p>

  <div className="flex gap-6">
    <Link
      href={settings.privacy_url || '/privacy'}
      className="text-sm text-slate-400 hover:text-primary transition-colors"
    >
      Privacy Policy
    </Link>

    <Link
      href={settings.terms_url || '/terms'}
      className="text-sm text-slate-400 hover:text-primary transition-colors"
    >
      Terms & Conditions
    </Link>
  </div>
</div>

      </div>
    </footer>
  );
}
