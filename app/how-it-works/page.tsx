// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Search, Calendar, Key, Home, CheckCircle, UserPlus, CreditCard, Shield, Phone, MessageSquare, Clock, Award, Users, Headphones } from 'lucide-react';
// import Link from 'next/link';

// export default function HowItWorksPage() {
//   const steps = [
//     {
//       number: "01",
//       icon: Search,
//       title: "Browse & Explore",
//       description: "Explore our carefully curated collection of premium properties across multiple locations. Use our advanced filters to search by area, price range, and amenities to find your perfect match.",
//       features: ["Advanced search filters", "High-quality property photos", "Detailed amenity lists", "Real-time availability"],
//       color: "from-blue-700 to-cyan-200",
//       bgColor: "bg-blue-50"
//     },
//     {
//       number: "02",
//       icon: Phone,
//       title: "Connect With Us",
//       description: "Reach out through your preferred channel - call, WhatsApp, or our contact form. Our dedicated team is ready to assist you 24/7 with instant responses to all your queries.",
//       features: ["24/7 support availability", "Multiple contact channels", "Instant query resolution", "Expert guidance"],
//       color: "from-red-300 to-pink-500",
//       bgColor: "bg-purple-50"
//     },
//     {
//       number: "03",
//       icon: Calendar,
//       title: "Schedule a Visit",
//       description: "Book a property tour at your convenience with flexible timing options. Experience our world-class facilities, meet our friendly staff, and get a real feel of your potential new home.",
//       features: ["Flexible visit timings", "Personal property tours", "Meet property staff", "Virtual tour option available"],
//       color: "from-green-500 to-emerald-500",
//       bgColor: "bg-green-50"
//     },
//     {
//       number: "04",
//       icon: UserPlus,
//       title: "Register & Verify",
//       description: "Complete a quick and secure registration process with your ID proof and basic documents. We maintain strict security protocols to ensure a safe living environment for all residents.",
//       features: ["Quick registration process", "Secure document verification", "Police verification included", "Privacy protection assured"],
//       color: "from-orange-500 to-red-500",
//       bgColor: "bg-orange-50"
//     },
//     {
//       number: "05",
//       icon: CreditCard,
//       title: "Make Payment",
//       description: "Choose from flexible payment options including online transfer, offline payment, or advance payment with special discounts. All transactions are secure and hassle-free.",
//       features: ["Multiple payment options", "Secure online gateway", "Advance payment discounts", "Transparent pricing"],
//       color: "from-indigo-500 to-purple-500",
//       bgColor: "bg-indigo-50"
//     },
//     {
//       number: "06",
//       icon: Key,
//       title: "Move In!",
//       description: "Receive your keys and welcome kit on your move-in date. Your fully-furnished room with all amenities is ready for you. Start your comfortable living experience immediately!",
//       features: ["Fully furnished rooms", "Welcome amenities kit", "Property orientation", "Immediate support access"],
//       color: "from-teal-500 to-cyan-500",
//       bgColor: "bg-teal-50"
//     }
//   ];

//   const features = [
//     {
//       icon: Shield,
//       title: "Secure & Safe",
//       description: "24/7 security with CCTV surveillance, biometric access, and verified residents for complete peace of mind",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: CheckCircle,
//       title: "Transparent Pricing",
//       description: "No hidden charges. All-inclusive pricing with clear breakdowns. What you see is what you pay",
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       icon: Headphones,
//       title: "24/7 Support",
//       description: "Dedicated support team available round-the-clock via call, WhatsApp, email, and in-person",
//       color: "from-purple-500 to-pink-500"
//     },
//     {
//       icon: Home,
//       title: "Ready to Move",
//       description: "Fully furnished rooms with all modern amenities. Pack your bags and move in from day one",
//       color: "from-orange-500 to-red-500"
//     },
//     {
//       icon: Award,
//       title: "Premium Quality",
//       description: "High-quality furniture, appliances, and fixtures. Regular maintenance and housekeeping included",
//       color: "from-indigo-500 to-purple-500"
//     },
//     {
//       icon: Users,
//       title: "Community Living",
//       description: "Connect with like-minded residents. Regular community events and networking opportunities",
//       color: "from-teal-500 to-cyan-500"
//     }
//   ];

//   const quickStats = [
//     { number: "500+", label: "Happy Residents", icon: Users },
//     { number: "50+", label: "Premium Properties", icon: Home },
//     { number: "10+", label: "Cities Covered", icon: Award },
//     { number: "24/7", label: "Support Available", icon: Clock }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
//       {/* Hero Section */}
//     <section className="relative overflow-hidden bg-gradient-to-br from-[#9aa5b1] via-blue-100 to-white py-24">
//   {/* Background elements */}
//   <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
//   <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20" />
//   <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

  
//   {/* <div className="absolute top-[10%] left-[5%] w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-400/80 rounded-full animate-[bounce_6s_ease-in-out_infinite]" />
//     <div className="absolute top-[20%] left-[25%] w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-400/80 rounded-full animate-[bounce_6s_ease-in-out_infinite]" />


//   <div className="absolute bottom-[15%] right-[5%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-blue-400/80 rounded-full animate-[bounce_5s_ease-in-out_infinite] animate-delay-[2s]" />
//    */}
//   {/* Cyan dot - top right */}
//   {/* <div className="absolute top-[30%] right-[15%] w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-cyan-400/60 rounded-full animate-ping animate-delay-[1s]" /> */}
  
//   {/* Yellow dot - bottom left */}
//   {/* <div className="absolute bottom-[30%] left-[15%] w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-blue-600/60 rounded-full animate-[bounce_4s_ease-in-out_infinite] animate-delay-[0.8s]" /> */}

//   <div className="container mx-auto px-4 relative">
//     <div className="max-w-4xl mx-auto text-center">
//       {/* Badge with animation */}
//       <div className="mb-6 animate-in zoom-in duration-500 delay-200">
//         <Badge className="bg-white backdrop-blur-md border-white/30 text-blue-800 hover:text-white px-6 py-2 text-sm transition-all duration-300 hover:scale-105">
//           Simple & Transparent Process
//         </Badge>
//       </div>
      
//       {/* Heading with animation */}
//       <h1 className="text-5xl text-slate-900 md:text-6xl font-bold mb-6 leading-tight animate-in zoom-in duration-700 delay-400">
//         How It Works
//       </h1>
      
//       {/* Paragraph with animation */}
//       <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed max-w-3xl mx-auto animate-in zoom-in duration-700 delay-600">
//         Your journey to comfortable living, simplified in 6 easy steps. From search to move-in, we make it seamless.
//       </p>
      
//       {/* Buttons with animation */}
//       <div className="flex flex-wrap justify-center gap-4 animate-in zoom-in duration-700 delay-800">
//         <Link href="/properties">
//           <Button size="lg" className="bg-white text-[#004AAD] hover:bg-blue-800 hover:text-white shadow-xl hover:shadow-2xl text-lg px-8 transition-all duration-300 hover:scale-105">
//             <Search className="mr-2 h-5 w-5" />
//             Browse Properties
//           </Button>
//         </Link>
//         <Link href="/contact">
//           <Button size="lg" variant="outline" className="border-2 border-white text-blue-600 hover:bg-blue-800 hover:text-white hover:border-blue-800 text-lg px-8 transition-all duration-300 hover:scale-105">
//             <Phone className="mr-2 h-5 w-5" />
//             Contact Us
//           </Button>
//         </Link>
//       </div>
//     </div>
//   </div>
// </section>

  
//     <section className="py-12 -mt-16 relative z-10">
//   <div className="container mx-auto px-4">
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//       {quickStats.map((stat, index) => {
//         // Icon colors array - 5 different DARK colors
//         const iconColors = [
//           'from-red-300 to-red-500',      // Dark Red
//           'from-blue-600 to-blue-600',    // Dark Blue
//           'from-green-400 to-green-600',  // Dark Green
//           'from-purple-500 to-purple-500',// Dark Purple
//           'from-amber-700 to-amber-900'   // Dark Yellow/Amber
//         ];
        
//         const accentColors = [
//           'border-red-500',      // Red
//           'border-blue-500',     // Blue
//           'border-green-500',    // Green
//           'border-purple-500',   // Purple
//           'border-amber-500'     // Yellow/Amber
//         ];
        
//         const shadowColors = [
//           'shadow-red-900/40',      // Dark Red shadow
//           'shadow-blue-900/40',     // Dark Blue shadow
//           'shadow-green-900/40',    // Dark Green shadow
//           'shadow-purple-900/40',   // Dark Purple shadow
//           'shadow-amber-900/40'     // Dark Amber shadow
//         ];
        
//         const hoverShadowColors = [
//           'group-hover:shadow-red-800/60',      // Dark Red
//           'group-hover:shadow-blue-800/60',     // Dark Blue
//           'group-hover:shadow-green-800/60',    // Dark Green
//           'group-hover:shadow-purple-800/60',   // Dark Purple
//           'group-hover:shadow-amber-800/60'     // Dark Amber
//         ];
        
//         const bottomLineColors = [
//           'bg-gradient-to-r from-red-600 to-red-800',      // Red
//           'bg-gradient-to-r from-blue-600 to-blue-800',    // Blue
//           'bg-gradient-to-r from-green-600 to-green-800',  // Green
//           'bg-gradient-to-r from-purple-600 to-purple-800',// Purple
//           'bg-gradient-to-r from-amber-600 to-amber-800'   // Amber
//         ];
        
//         const sideLineColors = [
//           'via-red-700',      // Dark Red
//           'via-blue-700',     // Dark Blue
//           'via-green-700',    // Dark Green
//           'via-purple-700',   // Dark Purple
//           'via-amber-700'     // Dark Amber
//         ];
        
//         const sideLineRightColors = [
//           'via-red-600',      // Red
//           'via-blue-600',     // Blue
//           'via-green-600',    // Green
//           'via-purple-600',   // Purple
//           'via-amber-600'     // Amber
//         ];
        
//         const cornerColors = [
//           'border-red-600/0 group-hover:border-red-500/80',      // Red
//           'border-blue-600/0 group-hover:border-blue-500/80',    // Blue
//           'border-green-600/0 group-hover:border-green-500/80',  // Green
//           'border-purple-600/0 group-hover:border-purple-500/80',// Purple
//           'border-amber-600/0 group-hover:border-amber-500/80'   // Amber
//         ];
        
//         const colorIndex = index % 5;
        
//         return (
//           <Card 
//             key={index} 
//             className="border-0 shadow-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 bg-white overflow-hidden group relative opacity-0 animate-[slideInRight_0.8s_ease-out_forwards]"
//             style={{
//               animationDelay: `${index * 200}ms`
//             }}
//           >
//             <CardContent className="p-6 text-center relative z-10 group">
//   {/* Icon Container */}
//   <div
//     className={`
//       h-16 w-16 mx-auto mb-4 rounded-3xl flex items-center justify-center
//       bg-gradient-to-br ${iconColors[colorIndex]}
//       shadow-lg ${shadowColors[colorIndex]} group-hover:shadow-2xl
//       relative overflow-hidden transition-transform duration-700
//       group-hover:scale-110 group-hover:-translate-y-1
//     `}
//   >
//     {/* Soft Glow */}
//     <div className={`
//       absolute inset-0 rounded-3xl
//       bg-gradient-to-r from-transparent via-white/20 to-transparent
//       animate-[shimmer_2s_infinite] 
//       pointer-events-none
//     `} />

//     {/* Pulse Ring */}
//     <div className={`
//       absolute inset-0 rounded-3xl border-2 ${accentColors[colorIndex]}
//       scale-100 group-hover:scale-125 opacity-60 group-hover:opacity-20
//       transition-all duration-700
//     `} />

//     {/* Icon */}
//     <stat.icon className="h-8 w-8 text-white relative z-10 drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
//   </div>

//   {/* Number */}
//   <h3 className="text-4xl font-extrabold mb-1 text-black transition-all duration-500 group-hover:text-gray-800 group-hover:scale-105">
//     {stat.number}
//   </h3>

//   {/* Label */}
//   <p className="text-sm text-gray-700 font-semibold transition-all duration-500 group-hover:text-gray-900 group-hover:tracking-wider">
//     {stat.label}
//   </p>

//   {/* Smooth Bottom Line with Dot */}
//   <div className={`
//     absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-3/4
//     ${bottomLineColors[colorIndex]} rounded-full transition-all duration-700
//   `}>
//     <div className="absolute top-1/2 left-0 w-2 h-2 bg-white rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 animate-[moveDot_1.5s_linear_infinite]" />
//   </div>

//   {/* Soft Background Glow on hover */}
//   <div className={`
//     absolute inset-0 rounded-xl -z-10
//     bg-gradient-to-br
//     ${['from-red-200/20', 'from-blue-200/20', 'from-green-200/20', 'from-purple-200/20', 'from-amber-200/20'][colorIndex]}
//     to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700
//   `} />
// </CardContent>

//           </Card>
//         );
//       })}
//     </div>
//   </div>
// </section>
//       {/* Steps Section */}
//       <section className="py-20 -mt-10">
//         <div className="container mx-auto px-4">
//           <div className="max-w-6xl mx-auto">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-white text-blue-700  hover:text-white border-black/15 px-4 py-1">
//                 Simple Process
//               </Badge>
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 opacity-0 animate-[reveal_1s_ease-out_0.5s_forwards]">
//   <span className="inline-block animate-[slideUp_0.5s_ease-out_forwards] opacity-0" style={{animationDelay: '1s'}}>
//     Your Journey to Comfortable Living
//   </span>
// </h2>
//               <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
//                 From browsing to moving in, we've streamlined everything to make your experience smooth and hassle-free
//               </p>
//             </div>

//             <div className="space-y-12">
//               {steps.map((step, index) => (
//                 <Card key={index} className="border-0 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-300 group">
//                   <CardContent className="p-0">
//                     <div className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
//                       {/* Icon Side */}
//                       <div className={`md:w-2/5 bg-gradient-to-br ${step.color} p-12 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
//                         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
//                         <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl" />

//                         <div className="relative z-10 text-center">
//                           <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl mx-auto group-hover:scale-110 transition-transform duration-300">
//                             <step.icon className="h-12 w-12" />
//                           </div>
//                           <div className="text-7xl font-bold mb-3 opacity-90">{step.number}</div>
//                           <div className="h-1 w-20 bg-white/50 mx-auto rounded-full" />
//                         </div>
//                       </div>

//                       {/* Content Side */}
//                       <div className="md:w-3/5 p-8 md:p-12 bg-white">
//                         <h3 className="text-3xl font-bold text-slate-900 mb-4">{step.title}</h3>
//                         <p className="text-lg text-slate-600 leading-relaxed mb-6">
//                           {step.description}
//                         </p>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           {step.features.map((feature, i) => (
//                             <div key={i} className={`flex items-center gap-3 ${step.bgColor} p-3 rounded-lg`}>
//                               <div className="h-2 w-2 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex-shrink-0" />
//                               <span className="text-sm font-medium text-slate-700">{feature}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
//         <div className="container mx-auto px-4">
//           <div className="max-w-6xl mx-auto">
//             <div className="text-center mb-16">
//               <Badge className="mb-4 bg-blue-100 text-[#004AAD] border-0 px-4 py-1">
//                 Why Choose Us
//               </Badge>
//               <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
//                 The ROOMAC Advantage
//               </h2>
//               <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
//                 We go beyond just providing a room — we create a home where you can thrive
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {features.map((feature, index) => (
//                 <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden">
//                   <CardContent className="p-8">
//                     <div className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
//                       <feature.icon className="h-8 w-8 text-white" />
//                     </div>
//                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
//                     <p className="text-slate-600 leading-relaxed">{feature.description}</p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 relative overflow-hidden bg-blue-900 text-white">
//         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

//         <div className="container mx-auto px-4 relative">
//           <div className="max-w-4xl mx-auto text-center">
//             <h2 className="text-4xl md:text-5xl font-bold mb-6">
//               Ready to Find Your Perfect Room?
//             </h2>
//             <p className="text-xl text-white/90 mb-8 leading-relaxed">
//               Join hundreds of happy residents who call ROOMAC home. Your perfect accommodation is just a few clicks away.
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Link href="/properties">
//                 <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl text-lg px-8">
//                   <Search className="mr-2 h-5 w-5" />
//                   Explore Properties
//                 </Button>
//               </Link>
//               <Link href="/contact">
//                 <Button size="lg" variant="outline" className="border-2 border-white text-blue-600 hover:bg-white/20 text-lg px-8">
//                   <Phone className="mr-2 h-5 w-5" />
//                   Talk to Us
//                 </Button>
//               </Link>
//             </div>
//             <p className="mt-8 text-white/80 text-sm">
//               Need help deciding? Our team is available 24/7 to assist you
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import HowItWorksClient from '@/components/how-it-works/HowItWorksClient';
import Loading from '@/components/how-it-works/loading';
import { getStaticData } from '@/components/how-it-works/data';

export default function HowItWorksPage() {
  const [initialData, setInitialData] = useState<Awaited<ReturnType<typeof getStaticData>> | null>(null);
  useEffect(() => {
    getStaticData().then(setInitialData);
  }, []);
  if (!initialData) return <Loading />;
  return <HowItWorksClient initialData={initialData as any} />;
}