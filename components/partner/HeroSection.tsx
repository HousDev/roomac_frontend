import { forwardRef } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  id: string;
  visible: boolean;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  ({ id, visible }, ref) => (
    <section
      ref={ref}
      id={id}
      className={`relative bg-gradient-to-br from-blue-200 to-slate-100 py-20 overflow-hidden transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
            {[...Array(144)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center"
              >
                <div 
                  className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${(i % 12) * 100}ms`,
                    animationDuration: `${Math.random() * 2 + 1}s`
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-[10%] left-[10%] animate-bounce animate-infinite animate-duration-[3000ms]">
            <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-blue-400/50" />
            <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping animate-infinite animate-duration-[2000ms]" />
          </div>
          
          <div className="absolute top-[15%] right-[15%] animate-bounce animate-infinite animate-duration-[3500ms] animate-delay-300">
            <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-blue-400/50" />
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[2500ms] animate-delay-200" />
          </div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce animate-infinite animate-duration-[4000ms] animate-delay-600">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[3000ms] animate-delay-400" />
          </div>
          
          <div className="absolute bottom-[20%] left-[20%] animate-bounce animate-infinite animate-duration-[3200ms] animate-delay-900">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
            <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[2800ms] animate-delay-600" />
          </div>
          
          <div className="absolute bottom-[15%] right-[10%] animate-bounce animate-infinite animate-duration-[3800ms] animate-delay-1200">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
            <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping animate-infinite animate-duration-[2200ms] animate-delay-800" />
          </div>
        </div>

        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => {
            const size = Math.random() * 2 + 1;
            return (
              <div
                key={i}
                className="absolute rounded-full bg-blue-300/40"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Partner with RoomAC
          </h1>
          
          <p className="text-xl text-slate-600 mb-8">
            Join thousands of property owners who trust us to manage their listings and connect with quality tenants.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-slate-700">No Setup Fees</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-slate-700">24/7 Support</span>
            </div>
            
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="text-slate-700">Fast Payouts</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
);

HeroSection.displayName = 'HeroSection';