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
      className={`relative py-8 overflow-hidden transition-all duration-1000 min-h-[420px] flex items-center ${visible ? 'translate-y-0' : 'translate-y-10'}`}
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=100" 
          alt="Luxury hotel bedroom with comfortable bed"
          className="w-full h-full object-cover"
        />
        {/* Clean dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-3xl mx-auto text-center">
  <span className="inline-block text-sm uppercase tracking-wider text-blue-300 font-semibold mb-3 animate-slide-in-left opacity-0 [animation-delay:100ms]">
    Trusted by 500+ Properties
  </span>
  
  <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 leading-tight animate-slide-in-left opacity-0 [animation-delay:200ms]">
    Partner with <span className="text-blue-400">Roomac</span>
  </h1>
  
  <p className="text-base md:text-xl text-white/90 mb-6 max-w-2xl mx-auto animate-slide-in-left opacity-0 [animation-delay:300ms]">
    Join thousands of property owners who trust us to manage their listings and connect with quality tenants.
  </p>
  
  <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base animate-slide-in-left opacity-0 [animation-delay:400ms]">
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span className="text-white">No Setup Fees</span>
    </div>
    
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span className="text-white">24/7 Support</span>
    </div>
    
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5 text-green-400" />
      <span className="text-white">Fast Payouts</span>
    </div>
  </div>
  
  {/* CTA Button */}
  <div className="mt-8 animate-slide-in-left opacity-0 [animation-delay:500ms]">
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-lg">
      Get Started Today
    </button>
  </div>
</div>
      </div>
    </section>
  )
);

HeroSection.displayName = 'HeroSection';