// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Card, CardContent } from '@/components/ui/card';
// import { Building2, Users, TrendingUp, Shield, CheckCircle2, Loader2 } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import { Toaster } from '@/components/ui/toaster';

// export default function PartnerPage() {
//   const { toast } = useToast();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [formData, setFormData] = useState({
//     company_name: '',
//     contact_person: '',
//     email: '',
//     phone: '',
//     property_count: '',
//     property_type: '',
//     location: '',
//     message: ''
//   });

//   // Refs for each section to trigger animations
//   const section1Ref = useRef(null);
//   const section2Ref = useRef(null);
//   const section3Ref = useRef(null);
//   const section4Ref = useRef(null);
//   const section5Ref = useRef(null);
  
//   const [visibleSections, setVisibleSections] = useState({
//     section1: false,
//     section2: false,
//     section3: false,
//     section4: false,
//     section5: false
//   });

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             const id = entry.target.id;
//             setVisibleSections(prev => ({
//               ...prev,
//               [id]: true
//             }));
//           }
//         });
//       },
//       {
//         threshold: 0.1,
//         rootMargin: '0px 0px -100px 0px'
//       }
//     );

//     // Observe all sections
//     if (section1Ref.current) observer.observe(section1Ref.current);
//     if (section2Ref.current) observer.observe(section2Ref.current);
//     if (section3Ref.current) observer.observe(section3Ref.current);
//     if (section4Ref.current) observer.observe(section4Ref.current);
//     if (section5Ref.current) observer.observe(section5Ref.current);

//     return () => {
//       observer.disconnect();
//     };
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData(prev => ({
//       ...prev,
//       [e.target.name]: e.target.value
//     }));
//   };

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/partners', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           property_count: parseInt(formData.property_count) || 1
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit inquiry');
//       }

//       setSubmitted(true);
//       toast({
//         title: 'Success!',
//         description: 'Your partnership inquiry has been submitted. We will contact you soon.',
//       });

//       setFormData({
//         company_name: '',
//         contact_person: '',
//         email: '',
//         phone: '',
//         property_count: '',
//         property_type: '',
//         location: '',
//         message: ''
//       });
//     } catch (error) {
//       toast({
//         title: 'Error',
//         description: 'Failed to submit your inquiry. Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const benefits = [
//     {
//       icon: TrendingUp,
//       title: 'Increase Revenue',
//       description: 'Maximize your property occupancy and revenue with our advanced booking and marketing reach.'
//     },
//     {
//       icon: Users,
//       title: 'Quality Tenants',
//       description: 'Access a pool of verified, quality tenants actively searching for accommodation.'
//     },
//     {
//       icon: Shield,
//       title: 'Secure Payments',
//       description: 'Safe and secure payment processing with transparent reporting and timely payouts.'
//     },
//     {
//       icon: Building2,
//       title: 'Property Management',
//       description: 'Comprehensive tools to manage your properties, bookings, and maintenance efficiently.'
//     }
//   ];

//   const steps = [
//     { number: '01', title: 'Submit Inquiry', description: 'Fill out the partnership form with your property details' },
//     { number: '02', title: 'Review & Approval', description: 'Our team reviews your application within 2-3 business days' },
//     { number: '03', title: 'Onboarding', description: 'Complete setup with dedicated support from our team' },
//     { number: '04', title: 'Start Earning', description: 'List your properties and start receiving bookings immediately' }
//   ];

//   return (
//     <>
//       <Toaster />
//       <div className="flex-1">
//         {/* Hero Section - First to appear */}
//         {/* Hero Section - First to appear */}
// <section 
//   ref={section1Ref}
//   id="section1"
//   className={`relative bg-gradient-to-br from-blue-200 to-slate-100 py-20 overflow-hidden transition-all duration-1000 ${visibleSections.section1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
// >
//   {/* Small dots covering all space */}
//   <div className="absolute inset-0 overflow-hidden">
//     {/* Large background dots grid */}
//     <div className="absolute inset-0 opacity-10">
//       <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
//         {[...Array(144)].map((_, i) => (
//           <div
//             key={i}
//             className="flex items-center justify-center"
//           >
//             <div 
//               className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
//               style={{
//                 animationDelay: `${(i % 12) * 100}ms`,
//                 animationDuration: `${Math.random() * 2 + 1}s`
//               }}
//             />
//           </div>
//         ))}
//       </div>
//     </div>

//     {/* Main 5 floating dots with animation */}
//     <div className="absolute inset-0">
//       {/* Top left */}
//       <div className="absolute top-[10%] left-[10%] animate-bounce animate-infinite animate-duration-[3000ms]">
//         <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-blue-400/50" />
//         <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping animate-infinite animate-duration-[2000ms]" />
//       </div>
      
//       {/* Top right */}
//       <div className="absolute top-[15%] right-[15%] animate-bounce animate-infinite animate-duration-[3500ms] animate-delay-300">
//         <div className="w-3 h-3 bg-cyan-500 rounded-full shadow-lg shadow-blue-400/50" />
//         <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[2500ms] animate-delay-200" />
//       </div>
      
//       {/* Center */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce animate-infinite animate-duration-[4000ms] animate-delay-600">
//         <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
//         <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[3000ms] animate-delay-400" />
//       </div>
      
//       {/* Bottom left */}
//       <div className="absolute bottom-[20%] left-[20%] animate-bounce animate-infinite animate-duration-[3200ms] animate-delay-900">
//         <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
//         <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping animate-infinite animate-duration-[2800ms] animate-delay-600" />
//       </div>
      
//       {/* Bottom right */}
//       <div className="absolute bottom-[15%] right-[10%] animate-bounce animate-infinite animate-duration-[3800ms] animate-delay-1200">
//         <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-400/50" />
//         <div className="absolute -inset-2 bg-blue-400/20 rounded-full animate-ping animate-infinite animate-duration-[2200ms] animate-delay-800" />
//       </div>
//     </div>

//     {/* Subtle moving dots */}
//     <div className="absolute inset-0">
//       {[...Array(40)].map((_, i) => {
//         const size = Math.random() * 2 + 1;
//         return (
//           <div
//             key={i}
//             className="absolute rounded-full bg-blue-300/40"
//             style={{
//               width: `${size}px`,
//               height: `${size}px`,
//               top: `${Math.random() * 100}%`,
//               left: `${Math.random() * 100}%`,
//               animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
//               animationDelay: `${Math.random() * 3}s`
//             }}
//           />
//         );
//       })}
//     </div>
//   </div>

//   <div className="container mx-auto px-4 relative z-10">
//     <div className="max-w-3xl mx-auto text-center">
//       <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
//         Partner with RoomAC
//       </h1>
      
//       <p className="text-xl text-slate-600 mb-8">
//         Join thousands of property owners who trust us to manage their listings and connect with quality tenants.
//       </p>
      
//       <div className="flex flex-wrap justify-center gap-8 text-sm">
//         <div className="flex items-center gap-2">
//           <CheckCircle2 className="w-6 h-6 text-green-600" />
//           <span className="text-slate-700">No Setup Fees</span>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <CheckCircle2 className="w-6 h-6 text-green-600" />
//           <span className="text-slate-700">24/7 Support</span>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <CheckCircle2 className="w-6 h-6 text-green-600" />
//           <span className="text-slate-700">Fast Payouts</span>
//         </div>
//       </div>
//     </div>
//   </div>
// </section>

//         {/* Benefits Section - Appears second */}
//       <section 
//   ref={section2Ref}
//   id="section2"
//   className={`py-16 bg-white transition-all duration-1000 delay-300 ${visibleSections.section2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
// >
//   <div className="container mx-auto px-4">
//     <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
//       Why Partner with Us?
//     </h2>
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
//       {benefits.map((benefit, index) => {
//         const colors = [
//           { 
//             bg: 'from-blue-100 to-blue-100',
//             bgHover: 'from-blue-200 to-blue-100',
//             icon: 'text-blue-600',
//             ring: 'border-blue-300/50',
//             shadow: 'shadow-blue-100/50',
//             shadowHover: 'shadow-blue-200/50',
//             titleHover: 'group-hover:text-blue-700',
//             underline: 'via-blue-300'
//           },
//           { 
//             bg: 'from-green-100 to-emerald-50',
//             bgHover: 'from-green-200 to-emerald-100',
//             icon: 'text-emerald-600',
//             ring: 'border-emerald-300/50',
//             shadow: 'shadow-green-100/50',
//             shadowHover: 'shadow-emerald-200/50',
//             titleHover: 'group-hover:text-emerald-700',
//             underline: 'via-emerald-300'
//           },
//           { 
//             bg: 'from-pink-100 to-rose-50',
//             bgHover: 'from-pink-200 to-rose-100',
//             icon: 'text-rose-600',
//             ring: 'border-rose-300/50',
//             shadow: 'shadow-pink-100/50',
//             shadowHover: 'shadow-rose-200/50',
//             titleHover: 'group-hover:text-rose-700',
//             underline: 'via-rose-300'
//           },
//           { 
//             bg: 'from-purple-100 to-violet-50',
//             bgHover: 'from-purple-200 to-violet-100',
//             icon: 'text-violet-600',
//             ring: 'border-violet-300/50',
//             shadow: 'shadow-purple-100/50',
//             shadowHover: 'shadow-violet-200/50',
//             titleHover: 'group-hover:text-violet-700',
//             underline: 'via-violet-300'
//           }
//         ];
        
//         const colorSet = colors[index % colors.length];
        
//         return (
//           <div 
//             key={index}
//             className={`h-full transition-all duration-700 delay-${index * 100} ${visibleSections.section2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
//           >
//             <Card className="h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white relative transform perspective-1000">
//               {/* Initial rotation animation on section appear */}
//               <div className={`absolute inset-0 rounded-xl transition-all duration-1000 ${visibleSections.section2 ? 'rotate-0 opacity-100' : 'rotate-y-90 opacity-0'}`} style={{ transitionDelay: `${index * 150}ms` }}>
//                 {/* Card Back Face (Initially hidden) */}
//                 <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${colorSet.bg} transition-all duration-700 ${visibleSections.section2 ? 'opacity-0' : 'opacity-100'}`}></div>
//               </div>
              
//               {/* Floating Corner Decorations */}
//               <div className={`absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-tl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:top-3 group-hover:left-3`} />
//               <div className={`absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-tr-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 group-hover:top-3 group-hover:right-3`} />
//               <div className={`absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-bl-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 group-hover:bottom-3 group-hover:left-3`} />
//               <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-br-lg opacity-0 group-hover:opacity-100 transition-all duration-500 delay-300 group-hover:bottom-3 group-hover:right-3`} />
              
//               {/* Main Card Content */}
//               <CardContent className="p-6 relative z-10 flex-grow flex flex-col">
//                 {/* Icon Container with Rotation Animation */}
//                 <div className="relative mb-6">
//                   <div className={`absolute -inset-2 bg-gradient-to-br ${colorSet.bg} rounded-2xl blur-md opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700`}></div>
//                   <div className={`relative bg-gradient-to-br ${colorSet.bg} w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:${colorSet.bgHover} transition-all duration-500 shadow-lg ${colorSet.shadow} group-hover:shadow-xl group-hover:${colorSet.shadowHover} transform group-hover:-translate-y-1`}>
//                     {/* Rotating ring animation on icon */}
//                     <div className={`absolute inset-0 rounded-xl border-2 ${colorSet.ring} group-hover:scale-125 group-hover:opacity-0 transition-all duration-700`} />
//                     <benefit.icon className={`w-7 h-7 ${colorSet.icon} group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`} />
//                   </div>
//                 </div>
                
//                 {/* Title with Gradient Underline */}
//                 <h3 className={`text-xl font-bold text-slate-800 mb-3 ${colorSet.titleHover} transition-colors duration-500 group-hover:translate-x-1 relative inline-block`}>
//                   {benefit.title}
//                   <span className={`absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r ${colorSet.underline} to-transparent transition-all duration-500 rounded-full`}></span>
//                 </h3>
                
//                 {/* Description with Equal Height */}
//                 <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-500 flex-grow">
//                   {benefit.description}
//                 </p>
                
//                 {/* Subtle Hover Indicator */}
//                 <div className="mt-6 flex items-center justify-end">
//                   <div className={`w-8 h-0.5 bg-gradient-to-r ${colorSet.underline} to-transparent group-hover:w-12 transition-all duration-500 rounded-full`}></div>
//                   <div className={`ml-2 w-0 h-0.5 ${colorSet.bgHover.split(' ')[0]} to-transparent group-hover:w-4 transition-all duration-500 delay-100 rounded-full`}></div>
//                 </div>
                
//                 {/* Animated Shine Effect */}
//                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
//               </CardContent>
              
//               {/* Bottom Border Animation */}
//               <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorSet.underline} to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left rounded-b-xl`} />
              
//               {/* Rotating Corner Elements on Card Hover */}
//               <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-tl-lg transform -rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '0ms'}} />
//               <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-tr-lg transform -rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '100ms'}} />
//               <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${colorSet.icon.replace('text', 'border')} rounded-bl-lg transform rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '200ms'}} />
//               <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${colorSet.icon.replace('text', 'border')} rounded-br-lg transform rotate-45 scale-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500`} style={{transitionDelay: '300ms'}} />
//             </Card>
//           </div>
//         );
//       })}
//     </div>
//   </div>
// </section>

//         {/* How It Works Section - Appears third */}
//         <section 
//           ref={section3Ref}
//           id="section3"
//           className={`py-16 bg-slate-50 shadow-xl hover:shadow-2xl transition-all duration-1000 delay-300 ${visibleSections.section3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
//         >
//           <div className="container mx-auto px-4">
//             <h2 className="text-4xl font-bold text-center text-slate-900 mb-12">
//               How It Works
//             </h2>
//             <div className="max-w-5xl mx-auto">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//                 {steps.map((step, index) => {
//                   const circleColors = [
//                     'bg-blue-100 text-blue-700',
//                     'bg-emerald-100 text-emerald-700',
//                     'bg-amber-100 text-amber-700',
//                     'bg-purple-100 text-purple-700'
//                   ];
                  
//                   const colorClass = circleColors[index % circleColors.length];
                  
//                   return (
//                     <div 
//                       key={index} 
//                       className={`relative group transition-all duration-700 delay-${index * 100} ${visibleSections.section3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
//                     >
//                       <div className="flex flex-col items-center text-center">
//                         <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-xl font-bold mb-4 relative overflow-hidden shadow-lg group-hover:scale-110 transition-all duration-500`}>
//                           <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
//                           <span className="relative z-10 group-hover:scale-125 transition-transform duration-500">
//                             {step.number}
//                           </span>
//                           <div className="absolute inset-0 rounded-full border-2 border-current opacity-20 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700" />
//                         </div>
                        
//                         <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-slate-700 transition-colors duration-500">
//                           {step.title}
//                         </h3>
//                         <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-500">
//                           {step.description}
//                         </p>
                        
//                         {index < steps.length - 1 && (
//                           <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Form Section - Appears fourth */}
//         <section 
//           ref={section4Ref}
//           id="section4"
//           className={`py-16 bg-white relative overflow-hidden transition-all duration-1000 delay-300 ${visibleSections.section4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
//         >
//           <div className="absolute inset-0">
//             <div className="absolute top-20 left-10 w-24 h-24 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[4000ms]" />
//             <div className="absolute top-10 right-20 w-16 h-16 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[5000ms] animate-delay-1000" />
//             <div className="absolute bottom-20 left-1/4 w-20 h-20 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[4500ms] animate-delay-500" />
//             <div className="absolute bottom-10 right-1/3 w-12 h-12 border border-slate-200 rounded-full animate-pulse animate-infinite animate-duration-[3500ms] animate-delay-1500" />
//           </div>

//           <div className="container mx-auto px-4 relative z-10">
//             <div className="max-w-3xl mx-auto">
//               <div className="text-center mb-12">
//                 <div className="inline-block mb-4">
//                   <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium">
//                     Partnership Program
//                   </div>
//                 </div>
//                 <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
//                   Ready to Get Started?
//                 </h2>
//                 <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//                   Fill out the form below and our partnership team will get in touch with you within 24 hours.
//                 </p>
//               </div>

//               {submitted ? (
//                 <div className={`bg-white border-2 border-slate-200 rounded-xl p-8 shadow-sm transition-all duration-1000 ${visibleSections.section4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
//                   <div className="text-center">
//                     <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <CheckCircle2 className="w-10 h-10 text-white" />
//                     </div>
//                     <h3 className="text-3xl font-bold text-slate-900 mb-3">
//                       Thank You
//                     </h3>
//                     <p className="text-slate-600 mb-8 text-lg">
//                       Your partnership inquiry has been successfully submitted. Our team will review your application and contact you within 24-48 hours.
//                     </p>
//                     <Button
//                       onClick={() => setSubmitted(false)}
//                       className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300"
//                     >
//                       Submit Another Inquiry
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-1000 ${visibleSections.section4 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
//                   <div className="bg-slate-900 p-6">
//                     <h3 className="text-2xl font-bold text-white text-center">
//                       Partnership Application
//                     </h3>
//                     <p className="text-slate-300 text-center mt-2">
//                       Complete all required fields to get started
//                     </p>
//                   </div>

//                   <div className="p-6 md:p-8">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-3">
//                           <Label htmlFor="company_name" className="text-slate-700 font-medium">
//                             Company Name <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <div className="absolute left-3 top-3 text-slate-400">
//                               🏢
//                             </div>
//                             <Input
//                               id="company_name"
//                               name="company_name"
//                               value={formData.company_name}
//                               onChange={handleChange}
//                               placeholder="Your company or property name"
//                               required
//                               disabled={isSubmitting}
//                               className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                             />
//                           </div>
//                         </div>

//                         <div className="space-y-3">
//                           <Label htmlFor="contact_person" className="text-slate-700 font-medium">
//                             Contact Person <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <div className="absolute left-3 top-3 text-slate-400">
//                               👤
//                             </div>
//                             <Input
//                               id="contact_person"
//                               name="contact_person"
//                               value={formData.contact_person}
//                               onChange={handleChange}
//                               placeholder="Your full name"
//                               required
//                               disabled={isSubmitting}
//                               className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-3">
//                           <Label htmlFor="email" className="text-slate-700 font-medium">
//                             Email Address <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <div className="absolute left-3 top-3 text-slate-400">
//                               ✉️
//                             </div>
//                             <Input
//                               id="email"
//                               name="email"
//                               type="email"
//                               value={formData.email}
//                               onChange={handleChange}
//                               placeholder="your@email.com"
//                               required
//                               disabled={isSubmitting}
//                               className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                             />
//                           </div>
//                         </div>

//                         <div className="space-y-3">
//                           <Label htmlFor="phone" className="text-slate-700 font-medium">
//                             Phone Number <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <div className="absolute left-3 top-3 text-slate-400">
//                               📱
//                             </div>
//                             <Input
//                               id="phone"
//                               name="phone"
//                               type="tel"
//                               value={formData.phone}
//                               onChange={handleChange}
//                               placeholder="+1 (555) 000-0000"
//                               required
//                               disabled={isSubmitting}
//                               className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div className="space-y-3">
//                           <Label htmlFor="property_type" className="text-slate-700 font-medium">
//                             Property Type <span className="text-red-500">*</span>
//                           </Label>
//                           <Select
//                             value={formData.property_type}
//                             onValueChange={(value) => handleSelectChange('property_type', value)}
//                             disabled={isSubmitting}
//                             required
//                           >
//                             <SelectTrigger className="py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all">
//                               <SelectValue placeholder="Select property type" />
//                             </SelectTrigger>
//                             <SelectContent className="rounded-lg border-slate-200 shadow-sm">
//                               <SelectItem value="hotel" className="py-3">Hotel</SelectItem>
//                               <SelectItem value="hostel" className="py-3">Hostel</SelectItem>
//                               <SelectItem value="apartment" className="py-3">Apartment</SelectItem>
//                               <SelectItem value="guesthouse" className="py-3">Guest House</SelectItem>
//                               <SelectItem value="resort" className="py-3">Resort</SelectItem>
//                               <SelectItem value="villa" className="py-3">Villa</SelectItem>
//                               <SelectItem value="other" className="py-3">Other</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>

//                         <div className="space-y-3">
//                           <Label htmlFor="property_count" className="text-slate-700 font-medium">
//                             Number of Properties <span className="text-red-500">*</span>
//                           </Label>
//                           <div className="relative">
//                             <div className="absolute left-3 top-3 text-slate-400">
//                               📊
//                             </div>
//                             <Input
//                               id="property_count"
//                               name="property_count"
//                               type="number"
//                               min="1"
//                               value={formData.property_count}
//                               onChange={handleChange}
//                               placeholder="1"
//                               required
//                               disabled={isSubmitting}
//                               className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <Label htmlFor="location" className="text-slate-700 font-medium">
//                           Primary Location <span className="text-red-500">*</span>
//                         </Label>
//                         <div className="relative">
//                           <div className="absolute left-3 top-3 text-slate-400">
//                             📍
//                           </div>
//                           <Input
//                             id="location"
//                             name="location"
//                             value={formData.location}
//                             onChange={handleChange}
//                             placeholder="City, State/Country"
//                             required
//                             disabled={isSubmitting}
//                             className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
//                           />
//                         </div>
//                       </div>

//                       <div className="space-y-3">
//                         <Label htmlFor="message" className="text-slate-700 font-medium">
//                           Additional Information
//                         </Label>
//                         <div className="relative">
//                           <div className="absolute left-3 top-3 text-slate-400">
//                             💬
//                           </div>
//                           <Textarea
//                             id="message"
//                             name="message"
//                             value={formData.message}
//                             onChange={handleChange}
//                             placeholder="Tell us more about your properties, expectations, or any questions you have..."
//                             rows={5}
//                             disabled={isSubmitting}
//                             className="pl-10 py-3 border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
//                           />
//                         </div>
//                       </div>

//                       <Button
//                         type="submit"
//                         className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={isSubmitting}
//                       >
//                         {isSubmitting ? (
//                           <>
//                             <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
//                             Submitting...
//                           </>
//                         ) : (
//                           'Submit Partnership Inquiry'
//                         )}
//                       </Button>

//                       <div className="text-center pt-4 border-t border-slate-100">
//                         <p className="text-sm text-slate-500">
//                           By submitting this form, you agree to our 
//                           <span className="text-slate-900 font-medium mx-1">Terms of Service</span> 
//                           and 
//                           <span className="text-slate-900 font-medium mx-1">Privacy Policy</span>.
//                         </p>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Footer Section - Appears fifth */}
//          <section 
//           ref={section5Ref}
//           id="section5"
//           className={`py-16 bg-blue-900  text-white transition-all duration-1000 delay-300 ${visibleSections.section5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
//         >
//           <div className="container mx-auto px-4 text-center">
//             <h2 className="text-3xl font-bold mb-4">
//               Have Questions?
//             </h2>
//             <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
//               Our partnership team is here to help. Contact us directly at{' '}
//               <a href="mailto:partners@roomac.com" className="text-white underline hover:no-underline">
//                 partners@roomac.com
//               </a>
//               {' '}or call us at{' '}
//               <a href="tel:+1-555-0000" className="text-white underline hover:no-underline">
//                 +1 (555) 000-0000
//               </a>
//             </p>
//           </div>
//         </section> 
       
//       </div>
//     </>
//   );
// }


import { useState, useEffect } from 'react';
import { PartnerPageClient } from '@/components/partner/PartnerPageClient';
import { LoadingSkeleton } from '@/components/partner/LoadingSkeleton';
import { getInitialData } from '@/components/partner/data';

export default function PartnerPage() {
  const [initialData, setInitialData] = useState<Awaited<ReturnType<typeof getInitialData>> | null>(null);
  useEffect(() => {
    getInitialData().then(setInitialData);
  }, []);
  if (!initialData) return <LoadingSkeleton />;
  return (
    <div className="flex-1">
      <PartnerPageClient initialData={initialData} />
    </div>
  );
}