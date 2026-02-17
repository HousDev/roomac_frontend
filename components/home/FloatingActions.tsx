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
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showScheduleButton, setShowScheduleButton] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Scroll top button - 800px ke baad
      setShowScrollTop(scrollY > 800);
      
      // WhatsApp button - 400px ke baad dikhna start ho (aap apni requirement ke hisab se change kar sakte hain)
      setShowWhatsApp(scrollY > 400);
      
      // Schedule button - bhi 400px ke baad dikhna start ho (ya jo bhi value aap chahein)
      setShowScheduleButton(scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
  <>
  {/* WhatsApp Button - Dikhega sirf 400px ke baad */}
  {showWhatsApp && ( 
  <a 
  href="https://wa.me/919923953933" 
  target="_blank" 
  rel="noopener noreferrer" 
  className="fixed bottom-[5rem] right-3 z-50 h-14 w-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group" 
  aria-label="Chat on WhatsApp"
>

    {/* WhatsApp Icon */} 
    <svg 
      className="h-8 w-8 text-white" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg" 
    > 
      <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.548 6.193 2.54 11.393c-.003 1.747.456 3.457 1.328 4.985L2.25 21.75l5.433-1.567c1.473.837 3.147 1.28 4.886 1.283h.004c5.198 0 9.462-4.194 9.47-9.394.004-2.511-.972-4.87-2.857-6.757l-.109-.107zm-7.071 14.485h-.003c-1.499 0-2.966-.402-4.24-1.157l-.304-.18-3.224.93.86-3.144-.198-.315c-.802-1.277-1.227-2.73-1.224-4.223.008-4.058 3.31-7.36 7.373-7.36 1.972 0 3.825.77 5.217 2.166 1.393 1.396 2.157 3.25 2.153 5.222-.007 4.061-3.31 7.361-7.37 7.361zm4.045-5.512c-.222-.111-1.32-.651-1.524-.725-.204-.074-.352-.111-.5.111-.148.222-.574.725-.703.874-.13.148-.259.167-.481.056-.222-.112-.94-.346-1.79-1.105-.662-.592-1.108-1.322-1.238-1.546-.13-.223-.014-.343.098-.453.1-.099.222-.259.333-.389.111-.13.148-.223.222-.371.074-.149.037-.278-.019-.39-.056-.111-.5-1.206-.685-1.652-.18-.435-.364-.369-.5-.376-.13-.007-.278-.007-.427-.007-.148 0-.389.056-.593.278-.204.222-.778.761-.778 1.856s.796 2.152.908 2.301c.111.149 1.498 2.383 3.695 3.242.52.204.923.325 1.24.416.52.148.995.127 1.37.077.418-.056 1.32-.54 1.505-1.06.185-.52.185-.966.13-1.06-.056-.093-.204-.148-.426-.259z" /> 
    </svg> 
 
    {/* Tooltip */} 
    <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"> 
      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg border border-white/10 backdrop-blur-sm"> 
        Chat with us 
        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-t border-white/10"></div> 
      </div> 
    </div> 
  </a> 
)}

  {/* Scroll to Top Button - Shows only when scrolled beyond 800px */}
  {showScrollTop && (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className="fixed bottom-36 right-6 z-50 group mb-3"
    >
      <div className="absolute inset-0 animate-ping bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20"></div>
      <div className="relative bg-gradient-to-r from-primary/90 to-blue-300/90 backdrop-blur-sm border border-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
        <ArrowUp className="h-6 w-6 group-hover:text-yellow-100" />
      </div>
    </motion.button>
  )}

  {/* Schedule Visit Button - Dikhega sirf 400px ke baad */}
  {showScheduleButton && (
    <div className="fixed bottom-6 right-6 z-50">
      <button onClick={() => setIsPopupOpen(true)} className="group relative">
        <div className="absolute inset-0 animate-ping bg-gradient-to-r from-primary to-blue-600 rounded-full opacity-20"></div>
        <div className="relative bg-gradient-to-r from-primary/90 to-blue-600/90 backdrop-blur-sm border border-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 group-hover:shadow-yellow-400/50 group-hover:shadow-lg">
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
  )}

  {/* Schedule Visit Popup - Yeh hamesha khulega jab button click hoga */}
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
              href="https://wa.me/919923953933?text=Hi%20ROOMAC,%20I%20want%20to%20book%20a%20visit"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full border-2 border-primary/80 text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-600/10 hover:border-primary backdrop-blur-sm transition-all duration-300"
              >
                <svg 
                  className="h-5 w-5 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19.077 4.928C17.191 3.041 14.683 2 12.006 2 6.798 2 2.548 6.193 2.54 11.393c-.003 1.747.456 3.457 1.328 4.985L2.25 21.75l5.433-1.567c1.473.837 3.147 1.28 4.886 1.283h.004c5.198 0 9.462-4.194 9.47-9.394.004-2.511-.972-4.87-2.857-6.757l-.109-.107zm-7.071 14.485h-.003c-1.499 0-2.966-.402-4.24-1.157l-.304-.18-3.224.93.86-3.144-.198-.315c-.802-1.277-1.227-2.73-1.224-4.223.008-4.058 3.31-7.36 7.373-7.36 1.972 0 3.825.77 5.217 2.166 1.393 1.396 2.157 3.25 2.153 5.222-.007 4.061-3.31 7.361-7.37 7.361zm4.045-5.512c-.222-.111-1.32-.651-1.524-.725-.204-.074-.352-.111-.5.111-.148.222-.574.725-.703.874-.13.148-.259.167-.481.056-.222-.112-.94-.346-1.79-1.105-.662-.592-1.108-1.322-1.238-1.546-.13-.223-.014-.343.098-.453.1-.099.222-.259.333-.389.111-.13.148-.223.222-.371.074-.149.037-.278-.019-.39-.056-.111-.5-1.206-.685-1.652-.18-.435-.364-.369-.5-.376-.13-.007-.278-.007-.427-.007-.148 0-.389.056-.593.278-.204.222-.778.761-.778 1.856s.796 2.152.908 2.301c.111.149 1.498 2.383 3.695 3.242.52.204.923.325 1.24.416.52.148.995.127 1.37.077.418-.056 1.32-.54 1.505-1.06.185-.52.185-.966.13-1.06-.056-.093-.204-.148-.426-.259z"/>
                </svg>
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