"use client";

import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { getSettings, SettingsData } from '@/lib/settingsApi';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';

export function Footer() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const fetchedSettings = await getSettings();
        setSettings(fetchedSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Helper function to get setting value from settings object
  const getSettingValue = (key: string, defaultValue: string = ''): string => {
    if (loading || !settings || !settings[key]) {
      return defaultValue;
    }
    return settings[key].value || defaultValue;
  };

  // Get the footer logo URL from settings
  const getLogoUrl = () => {
    if (loading || !settings) {
      return roomacLogo;
    }
    
    const logoUrl = getSettingValue('logo_footer');
    
    if (!logoUrl) {
      return roomacLogo;
    }
    
    // Check if the URL is already a full URL
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }
    
    // Check if it's a relative path starting with /
    if (logoUrl.startsWith('/')) {
      return logoUrl;
    }
    
    // If it's just a filename without a leading slash
    return `/${logoUrl}`;
  };

  // Get site name from settings
  const getSiteName = () => {
    return getSettingValue('site_name', 'ROOMAC');
  };

  // Get site tagline from settings
  const getSiteTagline = () => {
    return getSettingValue('site_tagline', 'Comfort, Care, and Quality Accommodation. Well-planned living spaces for professionals and students.');
  };

  // Get contact phone from settings
  const getContactPhone = () => {
    return getSettingValue('contact_phone', '9923 953 933');
  };

  // Get contact email from settings
  const getContactEmail = () => {
    return getSettingValue('contact_email', 'info@roomac.com');
  };

  // Get contact address from settings
  const getContactAddress = () => {
    return getSettingValue('contact_address', 'Wakad, Pune, Maharashtra 411057');
  };

  // Get Facebook URL from settings
  const getFacebookUrl = () => {
    return getSettingValue('facebook_url');
  };

  // Get Instagram URL from settings
  const getInstagramUrl = () => {
    return getSettingValue('instagram_url');
  };

  // Get LinkedIn URL from settings
  const getLinkedinUrl = () => {
    return getSettingValue('linkedin_url');
  };

  // Get Privacy URL from settings
  const getPrivacyUrl = () => {
    return getSettingValue('privacy_url', '/privacy');
  };

  // Get Terms URL from settings
  const getTermsUrl = () => {
    return getSettingValue('terms_url', '/terms');
  };

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
      src={roomacLogo} // Yaha default logo use karein
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
              {getSiteTagline()}
            </p>
            <div className="flex gap-3">
              {getFacebookUrl() && (
                <a href={getFacebookUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {getInstagramUrl() && (
                <a href={getInstagramUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {getLinkedinUrl() && (
                <a href={getLinkedinUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
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
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="inline-flex items-center gap-2 px-1 py-2 rounded-md">
                  <span className="text-white font-semibold text-sm">
                    Phone:
                  </span>
                  <a
                    href={`tel:${getContactPhone()}`}
                    className="text-blue-400 font-bold text-sm -ml-2 hover:underline"
                  >
                    {getContactPhone()}
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-white font-semibold text-sm">
                  Email:
                </span>
                <a href={`mailto:${getContactEmail()}`} className="text-sm text-blue-400 hover:text-primary transition-colors">
                  {getContactEmail()}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-300">
                  {getContactAddress()}
                </span>
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
            <div className="flex gap-3 pt-2">
              {getFacebookUrl() ? (
                <a href={getFacebookUrl()} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full transition-colors flex items-center justify-center">
                  <Facebook className="h-6 w-6 text-blue-500" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <Facebook className="h-6 w-6 text-blue-500" />
                </div>
              )}
              
              {getInstagramUrl() ? (
                <a href={getInstagramUrl()} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-blue-500" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-blue-500" />
                </div>
              )}
              
              {getLinkedinUrl() ? (
                <a href={getLinkedinUrl()} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full transition-colors flex items-center justify-center">
                  <Linkedin className="h-6 w-6 text-blue-500" />
                </a>
              ) : (
                <div className="h-10 w-10 rounded-full flex items-center justify-center">
                  <Linkedin className="h-6 w-6 text-blue-500" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} {getSiteName()}. All rights reserved.
          </p>

          <div className="flex gap-6">
            <Link
              href={getPrivacyUrl()}
              className="text-sm text-slate-400 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>

            <Link
              href={getTermsUrl()}
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