"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';
import { Card } from '@/components/ui/card';

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'MBA Student',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      comment: 'Great value for money. The food is delicious, WiFi is super fast, and the location is perfect for my college.',
      rating: 5,
    },
    {
      name: 'Sneha Patil',
      role: 'Marketing Manager',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      comment: 'Living at ROOMAC feels like staying with family. The staff is caring and always ready to help. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
      rating: 5,
    },
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
      comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
      rating: 5,
    }
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nextSlide = useCallback(() => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    } else {
      setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 1));
    }
    setIsAutoPlay(false);
  }, [testimonials.length, isMobile]);

  const prevSlide = useCallback(() => {
    if (isMobile) {
      setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + (testimonials.length - 1)) % (testimonials.length - 1));
    }
    setIsAutoPlay(false);
  }, [testimonials.length, isMobile]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  }, []);

  // Testimonials auto-play
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      if (isMobile) {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      } else {
        setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 1));
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlay, testimonials.length, isMobile]);

  // Calculate translate percentage based on screen size
  const getTranslatePercentage = () => {
    if (isMobile) {
      return currentIndex * 100;
    }
    return currentIndex * 50;
  };

  // Calculate card width based on screen size
  const getCardWidth = () => {
    if (isMobile) {
      return 'min-w-[calc(100%-2rem)]'; // Full width with some margin
    }
    return 'min-w-[40%]';
  };

  // Calculate dots count based on screen size
  const getDotsCount = () => {
    if (isMobile) {
      return testimonials.length;
    }
    return testimonials.length - 1;
  };

  // Get active dot index based on screen size
  const getActiveDotIndex = () => {
    if (isMobile) {
      return currentIndex;
    }
    return Math.floor(currentIndex / 2);
  };

  return (
    <ScrollAnimation>
      <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50 px-2 sm:px-4">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* ===== UPDATED HEADING (FEATURED STYLE) ===== */}
            <div className="text-center mb-10 sm:mb-14">
              <div className="flex items-center justify-center mb-4">
                <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>

                <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                  Testimonials
                </span>

                <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
                <span className="text-slate-800">Loved by</span>
                <span className="text-blue-600 ml-2">500+ Residents</span>
              </h2>

              <p className="text-base sm:text-lg md:text-xl text-slate-600 font-semibold font-sans">
                Hear what our residents have to say
              </p>
            </div>

            {/* Slider with responsive behavior */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex gap-3 sm:gap-[0.5px] transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${getTranslatePercentage()}%)` }}
                >
                  {testimonials.map((review, i) => (
                    <div key={i} className={`flex-shrink-0 px-2 mx-3 sm:px-0`}>
                      <div className={`group cursor-pointer bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative rounded-xl h-full ${
                        isMobile ? 'w-[300px]' : 'w-[400px] mx-auto'
                      }`}>
                        
                        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl"></div>

                        <div className="p-5 sm:p-6">
                          <div className="flex gap-1 mb-4">
                            {[...Array(review.rating)].map((_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>

                          <p className="text-sm text-slate-600 mb-5 leading-relaxed italic min-h-[120px]">
                            "{review.comment}"
                          </p>

                          <div className="flex items-center gap-2">
                            <img
                              src={review.image}
                              alt={review.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
                            />
                            <div>
                              <p className="font-bold text-sm text-yellow-400">
                                {review.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {review.role}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Left Button */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 z-10 bg-white hover:bg-blue-500 hover:text-white text-slate-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-slate-200"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Right Button */}
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-10 bg-white hover:bg-blue-500 hover:text-white text-slate-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-slate-200"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Dots - Responsive */}
            <div className="flex justify-center gap-1 mt-8">
              {testimonials.slice(0, getDotsCount()).map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(isMobile ? i : i * 2)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    getActiveDotIndex() === i
                      ? 'w-8 bg-blue-500'
                      : 'w-3 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}