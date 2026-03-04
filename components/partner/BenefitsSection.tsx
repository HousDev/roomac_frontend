import { forwardRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Shield, Building2 } from 'lucide-react';
import type { Benefit, ColorSet } from './types';

interface BenefitsSectionProps {
  id: string;
  visible: boolean;
  benefits: Benefit[];
}

const iconMap = {
  TrendingUp: TrendingUp,
  Users: Users,
  Shield: Shield,
  Building2: Building2,
};



export const BenefitsSection = forwardRef<HTMLElement, BenefitsSectionProps>(
  ({ id, visible, benefits }, ref) => {
    const delayClasses = useMemo(() => [
      'delay-0',
      'delay-100',
      'delay-200',
      'delay-300'
    ], []);

    return (
      <section
        ref={ref}
        id={id}
        className={`py-10 bg-white transition-all duration-1000 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container mx-auto px-4">
          
          {/* ================= CENTER HEADING ================= */}
       <div className="text-center mb-10 ">
  <h2 className="font-['Poppins'] text-3xl sm:text-4xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
  Why Partner with <span className="text-[#004AAD]">Us?</span>
</h2>
  <p className="font-['Poppins'] text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
    We combine strong business networks with meaningful benefits to <span className="font-semibold text-gray-800">accelerate your growth</span> and maximize opportunities.
  </p>
</div>
          {/* ================= TOP SECTION - BENEFITS CARDS ================= */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-20 max-w-5xl mx-auto">
  {benefits.map((benefit, index) => {
    const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
    const delayClass = delayClasses[index % delayClasses.length];
    
    return (
      <div
        key={index}
        className={`transition-all duration-700 ${delayClass} ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Card className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-500 group h-full max-w-md">
          {/* Accent line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-700 to-blue-500"></div>
          
          <CardContent className="p-6 bg-white">
            {/* Icon container */}
            <div className="mb-4 relative">
              <div className="w-12 h-12 rounded-xl bg-blue-700 flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-500">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              {/* Decorative element */}
              <div className="absolute -top-1 -right-1 w-14 h-14 bg-blue-50 rounded-full opacity-40 group-hover:scale-110 transition-all duration-500 -z-10"></div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-blue-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">
              {benefit.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {benefit.description}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  })}
</div>
          {/* ================= BOTTOM SECTION - NETWORK OVERLAP DESIGN ================= */}
       <div className="flex justify-center items-center py-2 -mt-8">
  {/* Desktop View - Original (UNCHANGED) */}
  <div className="hidden md:flex relative w-[800px] h-[800px] justify-center items-center">
    
    {/* CENTER CIRCLE */}
    <div className="absolute w-[400px] h-[400px] flex items-center justify-center z-[5]">
      <div className="absolute w-[300px] h-[300px] rounded-full border-[5px] border-white"></div>
      <div className="relative w-[260px] h-[260px] rounded-full border-[5px] border-[#5b9ce8] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-[#4a90e2] tracking-wide">
            PG BUSINESS
          </div>
          <div className="text-2xl font-bold text-[#2563eb] mt-1">
            NETWORK
          </div>
          <div className="mt-4 flex justify-center">
            <div className="w-[60px] h-[60px] flex items-center justify-center bg-white">
              <Building2
                className="w-8 h-8 text-[#4a90e2]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* IMAGE NODES */}
    {[
      { top: 'top-20', left: 'left-20', src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop' },
      { top: 'top-20', right: 'right-20', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
      { bottom: 'bottom-20', left: 'left-20', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop' },
      { bottom: 'bottom-20', right: 'right-14', src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop' },
    ].map((img, idx) => (
      <div
        key={idx}
        className={`absolute ${img.top || ''} ${img.bottom || ''} ${img.left || ''} ${img.right || ''} w-[300px] h-[300px] rounded-full border-[6px] border-[#5b9ce8] overflow-hidden bg-white transition-transform duration-300 hover:scale-110 hover:shadow-xl`}
      >
        <img src={img.src} alt={`Network ${idx}`} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>

  {/* Mobile View - Exact same layout, just scaled */}
  <div className="md:hidden relative w-[372px] h-[300px] flex items-center justify-center -mt-10">
    
    {/* CENTER CIRCLE */}
    <div className="absolute w-[175px] h-[175px] flex items-center justify-center z-[5]">
      <div className="absolute w-[130px] h-[130px] rounded-full border-[3px] border-white"></div>
      <div className="relative w-[115px] h-[115px] rounded-full border-[3px] border-[#5b9ce8] bg-white flex items-center justify-center">
        <div className="text-center px-1">
          <div className="text-[9px] font-bold text-[#4a90e2] tracking-wide">
            PG BUSINESS
          </div>
          <div className="text-xs font-bold text-[#2563eb] mt-0.5">
            NETWORK
          </div>
          <div className="mt-1.5 flex justify-center">
            <div className="w-[26px] h-[26px] flex items-center justify-center bg-white">
              <Building2
                className="w-4 h-4 text-[#083364]"
                strokeWidth={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* IMAGE NODES - Same positions, scaled */}
    {[
      { top: 'top-[10px]', left: 'left-[35px]', src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop' },
      { top: 'top-[10px]', right: 'right-[45px]', src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop' },
      { bottom: 'bottom-[10px]', left: 'left-[35px]', src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=400&fit=crop' },
      { bottom: 'bottom-[10px]', right: 'right-[45px]', src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop' },
    ].map((img, idx) => (
      <div
        key={idx}
        className={`absolute ${img.top || ''} ${img.bottom || ''} ${img.left || ''} ${img.right || ''} w-[131px] h-[131px] rounded-full border-[3px] border-[#5b9ce8] overflow-hidden bg-white transition-transform duration-300 hover:scale-110 hover:shadow-xl active:scale-105`}
      >
        <img src={img.src} alt={`Network ${idx}`} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
</div>
        </div>
      </section>
    );
  }
);

BenefitsSection.displayName = 'BenefitsSection';



// import { forwardRef, useMemo } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { TrendingUp, Users, Shield, Building2, ArrowRight, GraduationCap, FlaskConical, University, Globe } from 'lucide-react';
// import type { Benefit, ColorSet } from './types';

// interface BenefitsSectionProps {
//   id: string;
//   visible: boolean;
//   benefits: Benefit[];
// }

// const iconMap = {
//   TrendingUp: TrendingUp,
//   Users: Users,
//   Shield: Shield,
//   Building2: Building2,
// };

// export const BenefitsSection = forwardRef<HTMLElement, BenefitsSectionProps>(
//   ({ id, visible, benefits }, ref) => {
//     const delayClasses = useMemo(() => [
//       'delay-0',
//       'delay-100',
//       'delay-200',
//       'delay-300'
//     ], []);

//     return (
//       <section
//         ref={ref}
//         id={id}
//         className={`py-20 bg-gradient-to-b from-white to-gray-50 transition-all duration-1000 ${
//           visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
//         }`}
//       >
//         <div className="container mx-auto px-2">
          
//           {/* ================= MODERN HEADING ================= */}
//           <div className="text-center max-w-3xl mx-auto mb-3 -mt-10">
//             <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
//               Why Partner With Us
//             </span>
//             <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
//               Growth Through{' '}
//               <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
//                 Connection
//               </span>
//             </h2>
//             <p className="text-lg text-gray-600 leading-relaxed">
//               Join a network where opportunities meet expertise. We connect you with the right partners to accelerate your business growth.
//             </p>
//           </div>

//           {/* ================= COMPACT BENEFITS CARDS WITH LIGHT HOVER ================= */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-24 max-w-7xl mx-auto">
//             {benefits.map((benefit, index) => {
//               const IconComponent = iconMap[benefit.icon as keyof typeof iconMap];
//               const delayClass = delayClasses[index % delayClasses.length];
              
//               return (
//                 <div
//                   key={index}
//                   className={`transition-all duration-700 ${delayClass} ${
//                     visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
//                   }`}
//                 >
//                   {/* Desktop Card - UNCHANGED */}
//                   <Card className="hidden md:block group relative bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 h-full overflow-hidden">
//                     <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    
//                     <CardContent className="relative p-8 z-10 group-hover:text-white transition-colors duration-500">
//                       {/* Icon */}
//                       <div className="mb-6">
//                         <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500">
//                           <IconComponent className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors duration-500" />
//                         </div>
//                       </div>

//                       {/* Content */}
//                       <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white mb-3 transition-colors duration-500">
//                         {benefit.title}
//                       </h3>
//                       <p className="text-gray-600 group-hover:text-white/90 text-base leading-relaxed mb-6 transition-colors duration-500">
//                         {benefit.description}
//                       </p>

//                       {/* Hover indicator */}
//                       <div className="flex items-center text-blue-600 group-hover:text-white font-medium text-sm transition-colors duration-500">
//                         <span>Learn more</span>
//                         <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
//                       </div>
//                     </CardContent>
//                   </Card>

//                   {/* Mobile Card - Compact with Light Hover */}
//                   <Card className="md:hidden group relative bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 h-full overflow-hidden">
//                     <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
//                     <CardContent className="relative p-4 z-10">
//                       <div className="flex items-start gap-3">
//                         {/* Icon */}
//                         <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-300 flex-shrink-0">
//                           <IconComponent className="w-5 h-5 text-blue-600" />
//                         </div>

//                         <div className="flex-1 min-w-0">
//                           {/* Content */}
//                           <h3 className="text-sm font-semibold text-gray-900 mb-1">
//                             {benefit.title}
//                           </h3>
//                           <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">
//                             {benefit.description}
//                           </p>

//                           {/* Light indicator */}
//                           <div className="flex items-center text-blue-600 text-xs font-medium">
//                             <span>Learn more</span>
//                             <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
//                           </div>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               );
//             })}
//           </div>

//           {/* ================= MODERN NETWORK SECTION ================= */}
//           <div className="relative max-w-6xl mx-auto -mt-14">
//             {/* Section label */}
//             <div className="text-center mb-12">
//               <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium">
//                 Our Network
//               </span>
//               <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
//                 Connected with Industry Leaders
//               </h3>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 Join a diverse community of innovators, entrepreneurs, and industry experts
//               </p>
//             </div>

//             {/* Network visualization */}
//             <div className="relative flex justify-center items-center py-12">
//               {/* Desktop View - COMPLETELY UNCHANGED */}
//               <div className="hidden md:flex relative w-[1000px] h-[550px] justify-center items-center -mt-9 -mb-16">
                
//                 {/* Animated connection lines */}
//                 <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
//                   {/* Dotted lines with animation */}
//                   <circle cx="500" cy="275" r="180" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 8" className="animate-pulse" opacity="0.3" />
//                   <circle cx="500" cy="275" r="120" fill="none" stroke="#3B82F6" strokeWidth="1" strokeDasharray="6 6" opacity="0.2" />
                  
//                   {/* Connection lines to nodes */}
//                   <line x1="500" y1="275" x2="220" y2="120" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" className="animate-pulse" />
//                   <line x1="500" y1="275" x2="780" y2="120" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" className="animate-pulse" />
//                   <line x1="500" y1="275" x2="220" y2="430" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" className="animate-pulse" />
//                   <line x1="500" y1="275" x2="780" y2="430" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" className="animate-pulse" />
                  
//                   {/* Additional decorative dots */}
//                   <circle cx="360" cy="180" r="4" fill="#3B82F6" opacity="0.2" />
//                   <circle cx="640" cy="180" r="4" fill="#3B82F6" opacity="0.2" />
//                   <circle cx="360" cy="370" r="4" fill="#3B82F6" opacity="0.2" />
//                   <circle cx="640" cy="370" r="4" fill="#3B82F6" opacity="0.2" />
//                 </svg>

//                 {/* CENTER NODE */}
//                 <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
//                   <div className="relative">
//                     <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
//                     <div className="absolute inset-0 bg-blue-300 rounded-full animate-pulse opacity-30" style={{ animationDelay: '0.5s' }}></div>
//                     <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center shadow-2xl border-4 border-white">
//                       <div className="text-center text-white">
//                         <University className="w-12 h-12 mx-auto mb-3" />
//                         <div className="text-lg font-bold tracking-wider">PG BUSINESS</div>
//                         <div className="text-sm font-light tracking-widest">NETWORK</div>
//                         <div className="w-12 h-0.5 bg-white/30 mx-auto mt-3"></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* IMAGE NODES */}
//                 {[
//                   { 
//                     top: 'top-[5%]', 
//                     left: 'left-[8%]', 
//                     name: 'Premium Colleges', 
//                     role: 'Top B-Schools',
//                     image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop',
//                     icon: <GraduationCap className="w-6 h-6 text-blue-600" />
//                   },
//                   { 
//                     top: 'top-[5%]', 
//                     right: 'right-[8%]', 
//                     name: 'Research Labs', 
//                     role: 'Innovation Centers',
//                     image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop',
//                     icon: <FlaskConical className="w-6 h-6 text-blue-600" />
//                   },
//                   { 
//                     bottom: 'bottom-[5%]', 
//                     left: 'left-[8%]', 
//                     name: 'Faculty Network', 
//                     role: 'Expert Professors',
//                     image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop',
//                     icon: <Users className="w-6 h-6 text-blue-600" />
//                   },
//                   { 
//                     bottom: 'bottom-[5%]', 
//                     right: 'right-[8%]', 
//                     name: 'PG Alumni', 
//                     role: 'Global Leaders',
//                     image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=400&fit=crop',
//                     icon: <Globe className="w-6 h-6 text-blue-600" />
//                   },
//                 ].map((item, idx) => (
//                   <div
//                     key={idx}
//                     className={`absolute ${item.top || ''} ${item.bottom || ''} ${item.left || ''} ${item.right || ''} group cursor-pointer`}
//                   >
//                     <div className="relative">
//                       {/* Connection dot */}
//                       <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-4 ring-blue-100 animate-pulse"></div>
                      
//                       {/* Main circle */}
//                       <div className="relative w-44 h-44 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 overflow-hidden border-4 border-white ring-4 ring-blue-100/50">
//                         <img 
//                           src={item.image}
//                           alt={item.name}
//                           className="w-full h-full object-cover"
//                         />
//                         {/* Overlay on hover */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                       </div>
                      
//                       {/* Label */}
//                       <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30">
//                         <div className="bg-gray-900 text-white text-sm py-3 px-6 rounded-full shadow-xl border border-gray-700">
//                           <div className="font-semibold">{item.name}</div>
//                           <div className="text-xs text-gray-400">{item.role}</div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Mobile View - Fixed Positioning and Larger Nodes */}
// <div className="md:hidden relative w-full max-w-[380px] mx-auto h-[520px] -mt-16 -mb-20">                {/* Background pattern */}
//                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent opacity-30"></div>
                
//                 {/* SVG Connection lines - Fixed positioning */}
//                 <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
//                   {/* Center coordinates - properly centered */}
//                   {/* <circle cx="190" cy="260" r="140" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 8" opacity="0.3" /> */}
// <circle
//   cx="50%"
//   cy="50%"
//   r="100"
//   fill="none"
//   stroke="#3B82F6"
//   strokeWidth="1"
//   strokeDasharray="6 6"
//   opacity="0.2"
// />                  
//                   {/* Connection lines - properly aligned to center */}
//                   <line x1="190" y1="260" x2="50" y2="130" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
//                   <line x1="190" y1="260" x2="330" y2="130" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
//                   <line x1="190" y1="260" x2="50" y2="390" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
//                   <line x1="190" y1="260" x2="330" y2="390" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.4" />
//                 </svg>

//                 {/* CENTER NODE - Properly positioned */}
//               {/* CENTER NODE - Properly positioned with centered outer circles */}
// <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
//   <div className="relative flex items-center justify-center">
//     {/* पहला outer circle - अब बिल्कुल center में */}
//     <div className="absolute bg-blue-400 rounded-full animate-ping opacity-20" 
//          style={{ width: '180%', height: '180%' }}>
//     </div>
    
//     {/* दूसरा outer circle - अब बिल्कुल center में */}
//     <div className="absolute  rounded-full animate-pulse opacity-30" 
//          style={{ width: '150%', height: '150%', animationDelay: '0.5s' }}>
//     </div>
    
//     {/* Main center circle */}
//     <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center shadow-2xl border-4 border-white">
//       <div className="text-center text-white">
//         <University className="w-12 h-12 mx-auto mb-3" />
//         <div className="text-base font-bold tracking-wider">PG BUSINESS</div>
//         <div className="text-xs font-light tracking-widest">NETWORK</div>
//         <div className="w-10 h-0.5 bg-white/30 mx-auto mt-3"></div>
//       </div>
//     </div>
//   </div>
// </div>

//                 {/* IMAGE NODES - Larger size and better positioned */}
//                 {/* Top Left - Bigger */}
//                 <div className="absolute top-[5%] left-[2%] group cursor-pointer">
//                   <div className="relative">
//                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-4 ring-blue-100 animate-pulse"></div>
//                     <div className="relative w-32 h-32 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-white ring-4 ring-blue-100/50">
//                       <img 
//                         src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=400&fit=crop"
//                         alt="Premium Colleges"
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                     </div>
//                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30">
//                       <div className="bg-gray-900 text-white text-sm py-3 px-6 rounded-full shadow-xl border border-gray-700">
//                         <div className="font-semibold">Premium Colleges</div>
//                         <div className="text-xs text-gray-400">Top B-Schools</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Top Right - Bigger */}
//                 <div className="absolute top-[5%] right-[2%] group cursor-pointer">
//                   <div className="relative">
//                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-4 ring-blue-100 animate-pulse"></div>
//                     <div className="relative w-32 h-32 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-white ring-4 ring-blue-100/50">
//                       <img 
//                         src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=400&fit=crop"
//                         alt="Research Labs"
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                     </div>
//                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30">
//                       <div className="bg-gray-900 text-white text-sm py-3 px-6 rounded-full shadow-xl border border-gray-700">
//                         <div className="font-semibold">Research Labs</div>
//                         <div className="text-xs text-gray-400">Innovation Centers</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bottom Left - Bigger */}
//                 <div className="absolute bottom-[5%] left-[2%] group cursor-pointer">
//                   <div className="relative">
//                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-4 ring-blue-100 animate-pulse"></div>
//                     <div className="relative w-32 h-32 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-white ring-4 ring-blue-100/50">
//                       <img 
//                         src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop"
//                         alt="Faculty Network"
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                     </div>
//                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30">
//                       <div className="bg-gray-900 text-white text-sm py-3 px-6 rounded-full shadow-xl border border-gray-700">
//                         <div className="font-semibold">Faculty Network</div>
//                         <div className="text-xs text-gray-400">Expert Professors</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bottom Right - Bigger */}
//                 <div className="absolute bottom-[5%] right-[2%] group cursor-pointer">
//                   <div className="relative">
//                     <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-20 ring-4 ring-blue-100 animate-pulse"></div>
//                     <div className="relative w-32 h-32 rounded-full bg-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-4 border-white ring-4 ring-blue-100/50">
//                       <img 
//                         src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=400&h=400&fit=crop"
//                         alt="PG Alumni"
//                         className="w-full h-full object-cover"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                     </div>
//                     <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-30">
//                       <div className="bg-gray-900 text-white text-sm py-3 px-6 rounded-full shadow-xl border border-gray-700">
//                         <div className="font-semibold">PG Alumni</div>
//                         <div className="text-xs text-gray-400">Global Leaders</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     );
//   }
// );

// BenefitsSection.displayName = 'BenefitsSection';