"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSettings, SettingsData } from '@/lib/settingsApi';
import roomacLogo from '@/app/src/assets/images/roomaclogo.webp';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Get the logo URL from settings
  const getLogoUrl = () => {
    if (loading || !settings) {
      return roomacLogo;
    }
    
    const logoUrl = getSettingValue('logo_header');
    
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
    if (loading || !settings) {
      return "ROOMAC";
    }
    return getSettingValue('site_name', 'ROOMAC');
  };

  // Get contact phone from settings
  const getContactPhone = () => {
    return getSettingValue('contact_phone', '+919876543210');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <img
            src={getLogoUrl()}
            alt={getSiteName()}
            className="h-14 w-auto object-contain max-w-[200px]"
            onError={(e) => {
              // Fallback to default logo if the fetched logo fails to load
              (e.target as HTMLImageElement).src = roomacLogo;
            }}
          />
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium hover:text-primary transition-colors">
            Properties
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/partner" className="text-sm font-medium hover:text-primary transition-colors">
            Partner with Us
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <a href={`tel:${getContactPhone()}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
          </a>
          <Link href="/tenant/login">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Tenant Portal
            </Button>
          </Link>
          <Link href="/admin">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Admin
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/properties"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>
            <Link
              href="/how-it-works"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/partner"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Partner with Us
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              <a href={`tel:${getContactPhone()}`} className="block">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
              </a>
              <Link href="/tenant/login" className="block">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Tenant Portal
                </Button>
              </Link>
              <Link href="/admin" className="block">
                <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}