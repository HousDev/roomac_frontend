// "use client";

// import { useState, useEffect, useCallback } from 'react';
// import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
// import ScrollAnimation from './ScrollAnimation';
// import { Card } from '@/components/ui/card';

// export default function TestimonialsSlider() {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isAutoPlay, setIsAutoPlay] = useState(true);
//   const [isMobile, setIsMobile] = useState(false);

//   const testimonials = [
//     {
//       name: 'Priya Sharma',
//       role: 'Software Engineer',
//       image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
//       comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
//       rating: 5,
//     },
//     {
//       name: 'Rahul Verma',
//       role: 'MBA Student',
//       image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
//       comment: 'Great value for money. The food is delicious, WiFi is super fast, and the location is perfect for my college.',
//       rating: 5,
//     },
//     {
//       name: 'Sneha Patil',
//       role: 'Marketing Manager',
//       image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
//       comment: 'Living at ROOMAC feels like staying with family. The staff is caring and always ready to help. Highly recommended!',
//       rating: 5,
//     },
//     {
//       name: 'Priya Sharma',
//       role: 'Software Engineer',
//       image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
//       comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
//       rating: 5,
//     },
//     {
//       name: 'Priya Sharma',
//       role: 'Software Engineer',
//       image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400',
//       comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever!',
//       rating: 5,
//     }
//   ];

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   const nextSlide = useCallback(() => {
//     if (isMobile) {
//       setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//     } else {
//       setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 1));
//     }
//     setIsAutoPlay(false);
//   }, [testimonials.length, isMobile]);

//   const prevSlide = useCallback(() => {
//     if (isMobile) {
//       setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
//     } else {
//       setCurrentIndex((prev) => (prev - 1 + (testimonials.length - 1)) % (testimonials.length - 1));
//     }
//     setIsAutoPlay(false);
//   }, [testimonials.length, isMobile]);

//   const goToSlide = useCallback((index: number) => {
//     setCurrentIndex(index);
//     setIsAutoPlay(false);
//   }, []);

//   // Testimonials auto-play
//   useEffect(() => {
//     if (!isAutoPlay) return;
//     const interval = setInterval(() => {
//       if (isMobile) {
//         setCurrentIndex((prev) => (prev + 1) % testimonials.length);
//       } else {
//         setCurrentIndex((prev) => (prev + 1) % (testimonials.length - 1));
//       }
//     }, 4000);
//     return () => clearInterval(interval);
//   }, [isAutoPlay, testimonials.length, isMobile]);

//   // Calculate translate percentage based on screen size
//   const getTranslatePercentage = () => {
//     if (isMobile) {
//       return currentIndex * 100;
//     }
//     return currentIndex * 50;
//   };

//   // Calculate card width based on screen size
//   const getCardWidth = () => {
//     if (isMobile) {
//       return 'min-w-[calc(100%-2rem)]'; // Full width with some margin
//     }
//     return 'min-w-[40%]';
//   };

//   // Calculate dots count based on screen size
//   const getDotsCount = () => {
//     if (isMobile) {
//       return testimonials.length;
//     }
//     return testimonials.length - 1;
//   };

//   // Get active dot index based on screen size
//   const getActiveDotIndex = () => {
//     if (isMobile) {
//       return currentIndex;
//     }
//     return Math.floor(currentIndex / 2);
//   };

//   return (
//     <ScrollAnimation>
//       <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-gradient-to-b from-white to-slate-50 px-2 sm:px-4">
//         <div className="container mx-auto px-3 sm:px-4">
//           <div className="max-w-6xl mx-auto">
            
//             {/* ===== UPDATED HEADING (FEATURED STYLE) ===== */}
//             <div className="text-center mb-10 sm:mb-14">
//               <div className="flex items-center justify-center mb-4">
//                 <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>

//                 <span className="mx-2 sm:mx-4 text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
//                   Testimonials
//                 </span>

//                 <div className="h-1.5 w-6 sm:h-2 sm:w-8 bg-blue-600 rounded-full"></div>
//               </div>

//               <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
//                 <span className="text-slate-800">Loved by</span>
//                 <span className="text-blue-600 ml-2">500+ Residents</span>
//               </h2>

//               <p className="text-base sm:text-lg md:text-xl text-slate-600 font-semibold font-sans">
//                 Hear what our residents have to say
//               </p>
//             </div>

//             {/* Slider with responsive behavior */}
//             <div className="relative">
//               <div className="overflow-hidden">
//                 <div
//                   className="flex gap-3 sm:gap-[0.5px] transition-transform duration-700 ease-in-out"
//                   style={{ transform: `translateX(-${getTranslatePercentage()}%)` }}
//                 >
//                   {testimonials.map((review, i) => (
//                     <div key={i} className={`flex-shrink-0 px-2 mx-3 sm:px-0`}>
//                       <div className={`group cursor-pointer bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative rounded-xl h-full ${
//                         isMobile ? 'w-[300px]' : 'w-[400px] mx-auto'
//                       }`}>
                        
//                         <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 rounded-t-xl"></div>

//                         <div className="p-5 sm:p-6">
//                           <div className="flex gap-1 mb-4">
//                             {[...Array(review.rating)].map((_, index) => (
//                               <Star
//                                 key={index}
//                                 className="h-4 w-4 fill-yellow-400 text-yellow-400"
//                               />
//                             ))}
//                           </div>

//                           <p className="text-sm text-slate-600 mb-5 leading-relaxed italic min-h-[120px]">
//                             "{review.comment}"
//                           </p>

//                           <div className="flex items-center gap-2">
//                             <img
//                               src={review.image}
//                               alt={review.name}
//                               className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
//                             />
//                             <div>
//                               <p className="font-bold text-sm text-yellow-400">
//                                 {review.name}
//                               </p>
//                               <p className="text-xs text-slate-500">
//                                 {review.role}
//                               </p>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Left Button */}
//               <button
//                 onClick={prevSlide}
//                 className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-3 z-10 bg-white hover:bg-blue-500 hover:text-white text-slate-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-slate-200"
//               >
//                 <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
//               </button>

//               {/* Right Button */}
//               <button
//                 onClick={nextSlide}
//                 className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-10 bg-white hover:bg-blue-500 hover:text-white text-slate-800 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 border border-slate-200"
//               >
//                 <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
//               </button>
//             </div>

//             {/* Dots - Responsive */}
//             <div className="flex justify-center gap-1 mt-8">
//               {testimonials.slice(0, getDotsCount()).map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => goToSlide(isMobile ? i : i * 2)}
//                   className={`h-3 rounded-full transition-all duration-300 ${
//                     getActiveDotIndex() === i
//                       ? 'w-8 bg-blue-500'
//                       : 'w-3 bg-slate-300 hover:bg-slate-400'
//                   }`}
//                 />
//               ))}
//             </div>

//           </div>
//         </div>
//       </section>
//     </ScrollAnimation>
//   );
// }

"use client";

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import ScrollAnimation from './ScrollAnimation';

export default function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Fixed image for left side - same people looking at tablet
  const leftSideImage = "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800";

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      comment: 'ROOMAC has been amazing! The community vibe is incredible, and the facilities are top-notch. Best decision ever! Living here has transformed my daily routine.',
      rating: 4.9,
    },
    {
      name: 'Rahul Verma',
      role: 'MBA Student',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      comment: 'Great value for money. The food is delicious, WiFi is super fast, and the location is perfect for my college. The staff is always helpful and friendly.',
      rating: 4.9,
    },
    {
      name: 'Sneha Patil',
      role: 'Marketing Manager',
      image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      comment: 'Living at ROOMAC feels like staying with family. The staff is caring and always ready to help. Highly recommended for anyone looking for a home away from home!',
      rating: 4.9,
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
  };

  return (
    <ScrollAnimation>
      <section className="py-8 sm:py-12 md:py-14 lg:py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
              
              {/* LEFT SIDE - Fixed Image (Hidden on mobile/tablet) */}
              <div className="hidden lg:block order-2 lg:order-1">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[450px] xl:h-[500px]">
                  <img
                    src={leftSideImage}
                    alt="Happy ROOMAC residents"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                </div>
              </div>

              {/* RIGHT SIDE - Content */}
              <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
                
                {/* Header */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="inline-block">
                    <span 
                      className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#014aaa] bg-[#014aaa]/5 px-4 py-2 rounded-full border border-[#014aaa]/20"
                      style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                    >
                      Testimonials
                    </span>
                  </div>
                  
                  <h2 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                    style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                  >
                    <span className="block text-slate-900">Hear From Our</span>
                    <span className="block text-slate-900">Satisfied Customers</span>
                  </h2>
                </div>

                {/* Testimonial Card */}
                <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 sm:p-6 md:p-7 shadow-lg border border-slate-100">
                  
                  {/* Quote Icon */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 bg-[#014aaa] rounded-full flex items-center justify-center shadow-xl">
                    <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                  </div>

                  {/* Comment Text */}
                  <div className="mb-5 sm:mb-6 md:mb-7">
                    <p 
                      className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed italic"
                      style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                    >
                      "{testimonials[currentIndex].comment}"
                    </p>
                  </div>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={testimonials[currentIndex].image}
                        alt={testimonials[currentIndex].name}
                        className="w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                      {/* Rating Badge */}
                      <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 bg-[#014aaa] text-white px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 fill-[#fec006]" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-xs sm:text-sm font-bold">{testimonials[currentIndex].rating}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 
                        className="text-base sm:text-lg md:text-xl font-bold text-slate-900"
                        style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                      >
                        {testimonials[currentIndex].name}
                      </h3>
                      <p 
                        className="text-xs sm:text-sm md:text-base text-slate-600"
                        style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                      >
                        {testimonials[currentIndex].role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center lg:justify-start gap-2 pt-2 sm:pt-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        currentIndex === index
                          ? 'w-10 sm:w-12 h-2.5 sm:h-3 bg-[#014aaa]'
                          : 'w-2.5 sm:w-3 h-2.5 sm:h-3 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </ScrollAnimation>
  );
}