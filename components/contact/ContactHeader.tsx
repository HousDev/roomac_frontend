import { Badge } from '@/components/ui/badge';
import { Headphones } from 'lucide-react';

export default function ContactHeader() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#d2dae5] via-blue-100 to-blue-100 text-white py-10">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

     <div className="container mx-auto px-4 relative">
  <div className="max-w-4xl mx-auto text-center">
    {/* Badge */}
    <div className="overflow-hidden">
      <Badge 
        className="mb-6 bg-white backdrop-blur-md border-white/30 text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-400 px-6 py-2 text-sm transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-8 duration-800 delay-200 fill-mode-forwards"
      >
        <Headphones className="h-3 w-3 mr-1" />
        24/7 Support Available
      </Badge>
    </div>
    
    {/* Title */}
    <div className="overflow-hidden">
      <h1 
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black font-bold mb-6 leading-tight animate-in slide-in-from-bottom-12 duration-1000 delay-400 fill-mode-forwards zoom-in-95"
      >
        Get in Touch
      </h1>
    </div>
    
    {/* Paragraph */}
    <div className="overflow-hidden">
      <p 
        className="text-sm sm:text-base md:text-lg lg:text-xl text-black mb-8 leading-relaxed max-w-3xl mx-auto animate-[slideInLeft_0.8s_ease-out_0.6s_forwards] opacity-0 -translate-x-full"
      >
        Have questions? We're here to help you find your perfect accommodation. Reach out through any channel that suits you best.
      </p>
    </div>
  </div>
</div>
    </section>
  );
}