// components/home/FloatingActions.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Clock, Sparkles, Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 group"
        >
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20"></div>
          <div className="relative bg-gradient-to-r from-primary/90 to-blue-300/90 backdrop-blur-sm border border-white/30 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
            <ArrowUp className="h-6 w-6 group-hover:text-yellow-100" />
          </div>
        </motion.button>
      )}

      {/* Schedule Visit Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setIsPopupOpen(true)} className="group relative">
          <div className="absolute inset-0 animate-ping bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20"></div>
          <div className="relative bg-gradient-to-r from-primary/90 to-blue-600/90 backdrop-blur-sm border border-white/30 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group-hover:shadow-yellow-400/50 group-hover:shadow-lg">
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="28" 
                height="28" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-white group-hover:text-yellow-300 transition-colors"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" className="group-hover:stroke-yellow-300 transition-colors" />
                <path d="M12 7v3" className="stroke-yellow-400" />
                <path d="M8 9l2 2" className="stroke-yellow-400" />
                <path d="M16 9l-2 2" className="stroke-yellow-400" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Schedule Visit Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900/90 to-primary/90 backdrop-blur-sm px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-300" />
                  Schedule a Visit
                </h3>
                <button 
                  onClick={() => setIsPopupOpen(false)}
                  className="text-white/80 hover:text-yellow-300 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 text-center">
              <Badge className="mb-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 border-0 shadow-lg text-sm px-4 py-1.5">
                <Sparkles className="h-3 w-3 mr-1.5" />
                Ready to Move In?
              </Badge>
              
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-primary bg-clip-text text-transparent">
                Find Your Perfect Room Today
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Join 500+ happy residents living their best life at ROOMAC
              </p>
              
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 backdrop-blur-sm border border-white/30"
                  asChild
                >
                  <Link href="/properties">
                    <Home className="h-5 w-5 mr-2" />
                    Explore Properties
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                
                <a 
                  href="https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20want%20to%20book%20a%20visit"
                  className="block"
                >
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full border-2 border-primary/80 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary backdrop-blur-sm transition-all duration-300"
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Contact on WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}