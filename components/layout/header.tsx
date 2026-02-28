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
            className="h-14 w-auto object-contain max-w-[200px] transition-all duration-300 hover:scale-[1.02]"
            onError={(e) => {
              // Fallback to default logo if the fetched logo fails to load
              (e.target as HTMLImageElement).src = roomacLogo;
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            Properties
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            How It Works
          </Link>
          <Link href="/partner" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            Partner with Us
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            About Us
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-all duration-200 hover:scale-105">
            Contact
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <a href={`tel:${getContactPhone()}`} className="transition-all duration-300 hover:scale-105">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
          </a>
          <Link href="/login" className="transition-all duration-300 hover:scale-105">
            {/* <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Tenant Portal
            </Button> */}
          </Link>
          <Link href="/admin" className="transition-all duration-300 hover:scale-105">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 transition-all duration-300 hover:scale-110 active:scale-95"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 transition-all duration-500 rotate-180 scale-110" />
          ) : (
            <Menu className="h-6 w-6 transition-all duration-500" />
          )}
        </button>
      </nav>

      {/* Mobile Menu - All items centered */}
    {mobileMenuOpen && (
  <div className="md:hidden border-t bg-white overflow-hidden">
    <div className="flex flex-col items-center px-4 py-4 space-y-3 animate-in fade-in-50 slide-in-from-top-4 duration-500 ease-out">
      
      {/* Navigation Links */}
      <div className="w-full flex flex-col items-center space-y-2">
        <Link
          href="/"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Home
        </Link>

        <Link
          href="/properties"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Properties
        </Link>

        <Link
          href="/how-it-works"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          How It Works
        </Link>

        <Link
          href="/partner"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Partner with Us
        </Link>

        <Link
          href="/about"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          About Us
        </Link>

        <Link
          href="/contact"
          className="text-center text-sm font-medium hover:text-primary transition-all duration-300 hover:scale-105 hover:translate-x-1 w-full py-2"
          onClick={() => setMobileMenuOpen(false)}
        >
          Contact
        </Link>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>

      {/* Buttons */}
      <div className="flex flex-col items-center w-full space-y-3">
        <div className="flex justify-center items-center gap-3 w-full">
          
          <a 
            href={`tel:${getContactPhone()}`} 
            className="flex-1 max-w-[140px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
            >
              <Phone className="h-4 w-4" />
              Call Us
            </Button>
          </a>

          <Link 
            href="/admin" 
            className="flex-1 max-w-[140px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
          </Link>

        </div>
      </div>
    </div>
  </div>
)}
    </header>
  );
}