 
// components/home/Header.tsx
"use client";

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Award, Search, ArrowRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1, ease: "easeOut" }
  }
};

const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" }
  }
};

interface FourDirectionVariants {
  [key: string]: Variants;
}

export default function Header() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative min-h-[100vh] sm:min-h-[90vh] flex items-center bg-gradient-to-br from-slate-50 via-blue-200 to-blue-50 overflow-hidden px-2 pb-12 sm:px-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
      
      {/* Animated Dots */}
      <div className="absolute inset-0 overflow-hidden">
        {[
          { position: 'top-10 left-10', color: 'bg-yellow-400', delay: 0 },
          { position: 'top-12 right-15', color: 'bg-cyan-400', delay: 0.3 },
          { position: 'top-1/2 left-20', color: 'bg-blue-400', delay: 0.6 },
          { position: 'top-1/2 right-25', color: 'bg-primary', delay: 0.9 },
          { position: 'bottom-20 left-15', color: 'bg-yellow-400/70', delay: 1.2 },
          { position: 'bottom-15 right-20', color: 'bg-cyan-300', delay: 1.5 },
          { position: 'top-1/3 left-1/2', color: 'bg-blue-400/70', delay: 0.4 },
          { position: 'bottom-1/3 left-1/2', color: 'bg-primary/70', delay: 1.8 },
        ].map((dot, index) => (
          <motion.div
            key={index}
            className={`absolute ${dot.position} w-2 h-2 ${dot.color} rounded-full`}
            animate={{
              y: [0, dot.position.includes('top') ? -10 : 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + index * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: dot.delay
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isMounted ? "visible" : "hidden"}
              className="px-2 sm:px-0"
            >
              <motion.div variants={fadeInUp}>
                <Badge className="mb-4 sm:mb-6 bg-white shadow-lg backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-blue-200 text-blue-600 transform hover:border-y-indigo-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:text-white transition-all duration-300 inline-flex">
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 text-blue-600" />                    
                  India's Premium Co-Living Platform
                </Badge>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                  <span className="block text-slate-900">Your Perfect</span>
                  <span className="block bg-gradient-to-r from-primary via-blue-900 to-cyan-800 bg-clip-text text-transparent">
                    Home Awaits
                  </span>
                </h1>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <p className="text-base sm:text-lg md:text-xl text-black mb-6 sm:mb-8 leading-relaxed">
                  Experience premium co-living spaces designed for comfort, community, and convenience. Find your ideal room in minutes.
                </p>
              </motion.div>

              <motion.div variants={staggerContainer} className="flex flex-wrap gap-4 sm:gap-6 mb-6 sm:mb-8">
                <motion.div variants={fadeInScale} className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-black ">500+ Happy Residents</p>
                    <p className="text-xs sm:text-sm text-slate-500">Living their best life</p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInScale} className="flex items-center gap-2 sm:gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-black">4.7 Average Rating</p>
                    <p className="text-xs sm:text-sm text-slate-500">Trusted by residents</p>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/properties" className="flex-1">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary w-full text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base h-12 sm:h-14 gap-2">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                    Explore Properties
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button size="lg" variant="outline" className="w-full border-2 border-slate-800 hover:border-slate-900 text-black h-12 sm:h-14 hover:shadow-lg transition-all duration-300">
                    Talk to Expert
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right side image grid */}
            <ImageGrid isMounted={isMounted} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ImageGrid component extracted for better organization
function ImageGrid({ isMounted }: { isMounted: boolean }) {
  const fourDirectionVariants: FourDirectionVariants = {
    left: {
      hidden: { opacity: 0, x: -100, scale: 0.9 },
      visible: { 
        opacity: 1, x: 0, scale: 1,
        transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6, delay: 0.2 }
      }
    },
    right: {
      hidden: { opacity: 0, x: 100, scale: 0.9 },
      visible: { 
        opacity: 1, x: 0, scale: 1,
        transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6, delay: 0.3 }
      }
    },
    top: {
      hidden: { opacity: 0, y: -100, scale: 0.9 },
      visible: { 
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6, delay: 0.4 }
      }
    },
    bottom: {
      hidden: { opacity: 0, y: 100, scale: 0.9 },
      visible: { 
        opacity: 1, y: 0, scale: 1,
        transition: { type: "spring", stiffness: 80, damping: 15, duration: 0.6, delay: 0.5 }
      }
    }
  };

  const images = [
    { src: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg", alt: "Modern living room", variant: "left", className: "h-48" },
    { src: "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg", alt: "Cozy bedroom", variant: "right", className: "h-32" },
    { src: "https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg", alt: "Community space", variant: "top", className: "h-32" },
    { src: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg", alt: "Comfortable workspace", variant: "bottom", className: "h-48" },
  ];

  return (
    <motion.div className="relative lg:block hidden" initial="hidden" animate={isMounted ? "visible" : "hidden"} variants={staggerContainer}>
      <div className="relative">
        {/* Animated background circles */}
        <AnimatedCircles />
        
        {/* Image grid */}
        <div className="relative grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {images.slice(0, 2).map((img, index) => (
              <motion.div 
                key={index} 
                variants={fourDirectionVariants[img.variant]} 
                initial="hidden" 
                animate={isMounted ? "visible" : "hidden"}
              >
                <Card className={`shadow-2xl border-0 overflow-hidden ${index === 0 ? 'transform hover:scale-105 transition-transform' : ''}`}>
                  <div className={`${img.className} bg-gradient-to-br from-blue-100 to-blue-300 relative overflow-hidden`}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="space-y-4 pt-12">
            {images.slice(2, 4).map((img, index) => (
              <motion.div 
                key={index + 2} 
                variants={fourDirectionVariants[img.variant]} 
                initial="hidden" 
                animate={isMounted ? "visible" : "hidden"}
              >
                <Card className={`shadow-2xl border-0 overflow-hidden ${index === 1 ? 'transform hover:scale-105 transition-transform' : ''}`}>
                  <div className={`${img.className} bg-gradient-to-br from-cyan-100 to-blue-100 relative overflow-hidden`}>
                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedCircles() {
  return (
    <>
      <motion.div className="absolute -top-9 -left-6 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.1, 1], x: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div className="absolute -top-6 -right-6 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.2, 1], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2.7 }}
      />
      <motion.div className="absolute -bottom-6 left-10 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl sm:blur-3xl opacity-30"
        animate={{ scale: [1, 1.15, 1], x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </>
  );
}

// Simple Card component
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</div>;
}