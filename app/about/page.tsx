// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { CheckCircle, Users, Home, Award, Target, Heart, Shield, Zap, Sparkles, TrendingUp, Globe, Building2 } from 'lucide-react';
// import Link from 'next/link';

// export default function AboutPage() {
//   const stats = [
//     { number: "500+", label: "Happy Residents", icon: Users, color: "from-blue-500 to-cyan-500" },
//     { number: "50+", label: "Premium Properties", icon: Home, color: "from-green-500 to-emerald-500" },
//     { number: "10+", label: "Cities Covered", icon: Globe, color: "from-purple-500 to-pink-500" },
//     { number: "4.8", label: "Average Rating", icon: Award, color: "from-orange-500 to-red-500" }
//   ];

//   const values = [
//     {
//       icon: Heart,
//       title: 'Comfort First',
//       description: 'We believe comfortable living spaces are essential for productivity and well-being. Every detail, from furniture to room layout, is thoughtfully designed with your comfort in mind.',
//       color: "from-red-500 to-pink-500"
//     },
//     {
//       icon: Shield,
//       title: 'Transparent & Fair',
//       description: 'No hidden charges, no surprises. Our pricing is crystal clear, and our policies are resident-friendly. What you see is exactly what you get.',
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: Users,
//       title: 'Community Focused',
//       description: 'We foster a vibrant sense of community where residents feel connected, supported, and at home. Regular events and networking opportunities bring everyone together.',
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       icon: Zap,
//       title: 'Quality Assurance',
//       description: 'From furniture to food, from maintenance to security — we maintain the highest standards in everything we do. Your satisfaction is our priority.',
//       color: "from-purple-500 to-pink-500"
//     }
//   ];

//   const milestones = [
//     { year: "2019", title: "Founded", description: "ROOMAC started with a vision to redefine co-living" },
//     { year: "2020", title: "Expansion", description: "Opened properties in 5 major cities" },
//     { year: "2021", title: "Innovation", description: "Launched digital tenant portal and smart features" },
//     { year: "2024", title: "Growth", description: "Serving 500+ happy residents across 50+ properties" }
//   ];

//   const team = [
//     {
//       icon: Target,
//       title: "Our Mission",
//       description: "To provide premium, affordable co-living spaces that combine comfort, community, and convenience for young professionals and students."
//     },
//     {
//       icon: TrendingUp,
//       title: "Our Vision",
//       description: "To become India's most trusted co-living brand, known for exceptional quality, transparent practices, and resident satisfaction."
//     },
//     {
//       icon: Building2,
//       title: "Our Approach",
//       description: "We leverage technology, maintain high standards, and listen to our residents to continuously improve and innovate our services."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
//       {/* Hero Section */}
// <section className="relative overflow-hidden bg-gradient-to-br from-blue-200 via-[#cfdbea] text-white py-24">       
//   <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
//   <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[3000ms]" />
//   <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse animate-infinite animate-duration-[4000ms] animate-delay-1000" />

//   <div className="container mx-auto px-4 relative">
//     <div className="max-w-4xl mx-auto text-center">
//       <Badge className="mb-6 bg-white backdrop-blur-md border-white/30 text-blue-400 hover:text-white px-6 py-2 text-sm opacity-0 animate-[popIn_0.6s_ease-out_0.2s_forwards] hover:scale-105 transition-transform duration-300">
//         <Sparkles className="h-3 w-3 mr-1 animate-spin animate-infinite animate-duration-[2000ms]" />
//         Trusted by 500+ Residents
//       </Badge>
      
//       <h1 className="text-5xl md:text-6xl text-black font-bold mb-6 leading-tight">
//         <div className="inline-block overflow-hidden whitespace-nowrap">
//           <span className="inline-block animate-[typewriter_2.5s_steps(11,end)_forwards_0.5s]">
//             About ROOMAC
//           </span>
//         </div>
//       </h1>
      
//       <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed max-w-3xl mx-auto opacity-0 animate-[fadeUp_1s_ease-out_1.5s_forwards]">
//         Redefining co-living with Comfort, Care, and Quality Accommodation. 
//         <span className="block mt-2 font-bold text-slate-700 animate-[pulse_2s_ease-in-out_infinite_2s]">
//           We create spaces where you don't just live — you thrive.
//         </span>
//       </p>
//     </div>
//   </div>

//   <div className="hidden">
//     <style>
//       {`@keyframes popIn {0%{opacity:0;transform:scale(0.8) translateY(-20px);}80%{transform:scale(1.05);}100%{opacity:1;transform:scale(1) translateY(0);}}@keyframes typewriter {from{width:0;}to{width:100%;}}@keyframes fadeUp {from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}`}
//     </style>
//   </div>
// </section>

//       {/* Stats Section */}
//       <section className="py-12 -mt-16 relative z-10 overflow-hidden">
//   <div className="container mx-auto px-4">
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//       {stats.map((stat, index) => (
//         <div 
//           key={index} 
//           className="opacity-0 -translate-y-full"
//           style={{
//             animation: `slideInFromBottom 0.6s ease-out ${index * 0.15 + 0.2}s forwards`
//           }}
//         >
//           <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
//             <CardContent className="p-6 text-center">
//               <div className={`h-16 w-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
//                 <stat.icon className="h-8 w-8 text-white" />
//               </div>
//               <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.number}</h3>
//               <p className="text-sm font-medium text-slate-600">{stat.label}</p>
//             </CardContent>
//           </Card>
//         </div>
//       ))}
//     </div>
//   </div>

//   <div className="hidden">
//     <style>
//       {`@keyframes slideInFromBottom {from{opacity:0;transform:translateY(100px);}to{opacity:1;transform:translateY(0);}}`}
//     </style>
//   </div>
// </section>

//       {/* Story Section */}
//      <section className="py-20 relative overflow-hidden">
//   {/* Background floating shapes with delays */}
//   <div className="absolute inset-0 overflow-hidden">
//     {/* Floating abstract shapes with staggered delays */}
//     <div className="absolute top-1/4 left-10 w-8 h-8 border-2 border-blue-300/30 rounded-lg animate-[floatShape_15s_linear_infinite] rotate-45 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]" />
//     <div className="absolute top-1/3 right-20 w-6 h-6 border border-cyan-400/20 rounded-full animate-[floatShape_20s_linear_infinite_2s] opacity-0 animate-[fadeIn_1s_ease-out_1.2s_forwards]" />
//     <div className="absolute bottom-1/4 left-1/3 w-10 h-10 border-2 border-blue-400/25 rounded-lg animate-[floatShape_18s_linear_infinite_1s] rotate-12 opacity-0 animate-[fadeIn_1s_ease-out_1.4s_forwards]" />
//     <div className="absolute bottom-1/3 right-1/4 w-7 h-7 border border-cyan-300/30 rounded-full animate-[floatShape_25s_linear_infinite_3s] opacity-0 animate-[fadeIn_1s_ease-out_1.6s_forwards]" />
//   </div>

//   <div className="container mx-auto px-4 relative z-10">
//     <div className="max-w-5xl mx-auto">
//       {/* Title section with delayed typing effect */}
//       <div className="text-center mb-16 overflow-hidden">
//         <div className="inline-block mb-4 opacity-0 animate-[badgePop_0.6s_ease-out_1s_forwards]">
//           <Badge className="bg-gradient-to-r from-blue-100 to-cyan-100 text-[#004AAD] border-0 px-6 py-2 shadow-lg hover:scale-105 transition-transform duration-300">
//             <div className="flex items-center gap-2">
//               <div className="w-2 h-2 bg-[#004AAD] rounded-full animate-pulse animate-delay-1000" />
//               Our Story
//               <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse animate-delay-1000" />
//             </div>
//           </Badge>
//         </div>
        
//         <div className="relative">
//           <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 overflow-hidden">
//             <div className="inline-block">
//               {["Building", "Homes,", "Creating", "Communities"].map((word, wordIndex) => (
//                 <span key={wordIndex} className="inline-block mr-2">
//                   {word.split("").map((letter, letterIndex) => (
//                     <span
//                       key={`${wordIndex}-${letterIndex}`}
//                       className="inline-block opacity-0 animate-[letterReveal_0.3s_ease-out_forwards]"
//                       style={{ animationDelay: `${1.2 + (wordIndex * 0.2) + (letterIndex * 0.03)}s` }}
//                     >
//                       {letter}
//                     </span>
//                   ))}
//                 </span>
//               ))}
//             </div>
//           </h2>
          
//           {/* Animated underline with delay */}
//           <div className="h-1 w-0 mx-auto bg-gradient-to-r from-blue-400 via-[#004AAD] to-cyan-400 opacity-0 animate-[underlineGrow_1.5s_ease-out_2s_forwards]" />
//         </div>
//       </div>

//       {/* Main card with delayed floating effect */}
//       <div className="relative group opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
//         {/* Glow effect behind card */}
//         <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
//         <Card className="border-0 shadow-2xl mb-12 relative overflow-hidden backdrop-blur-sm bg-white/95">
//           {/* Animated border */}
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-[#004AAD] to-cyan-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          
//           <CardContent className="p-8 md:p-12 relative z-10">
//             {/* Paragraphs with staggered delayed reveal */}
//             {[
//               "ROOMAC was founded with a simple yet powerful vision: to create living spaces that feel like home for professionals and students away from their families. We understand the challenges of finding quality accommodation that perfectly balances comfort, affordability, and community.",
//               "What started as a single property has grown into a thriving network across major cities. Today, ROOMAC operates 50+ premium properties, serving hundreds of residents who trust us for their accommodation needs. Our commitment to quality, transparent pricing, and resident satisfaction has made us a preferred choice for co-living.",
//               "But we're more than just a place to stay. We're a community where friendships are formed, careers are built, and memories are created. Every ROOMAC property is designed to foster connections, support personal growth, and provide the peace of mind you need to focus on what matters most."
//             ].map((paragraph, index) => (
//               <div 
//                 key={index} 
//                 className="mb-6 last:mb-0 overflow-hidden"
//               >
//                 <div 
//                   className="text-lg text-slate-700 leading-relaxed transform translate-x-full opacity-0"
//                   style={{
//                     animation: `slideInParagraph 0.8s ease-out ${1.8 + (index * 0.4)}s forwards`
//                   }}
//                 >
//                   {paragraph}
//                 </div>
//               </div>
//             ))}
//           </CardContent>
          
//           {/* Floating particles inside card with delays */}
//           <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/30 rounded-full opacity-0 animate-[bounce_2s_ease-in-out_infinite,fadeIn_0.5s_ease-out_2.5s_forwards]" />
//           <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-cyan-400/40 rounded-full opacity-0 animate-[bounce_2s_ease-in-out_infinite_0.5s,fadeIn_0.5s_ease-out_2.7s_forwards]" />
//         </Card>
//       </div>

//       {/* Mission, Vision, Approach cards with delayed 3D tilt effect */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
//         {team.map((item, index) => (
//           <div 
//             key={index}
//             className="transform-gpu perspective-1000"
//             style={{
//               opacity: 0,
//               transform: 'translateY(30px) rotateX(10deg)',
//               animation: `card3DAppear 0.8s ease-out ${2.2 + (index * 0.2)}s forwards`
//             }}
//           >
//             <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 cursor-pointer bg-gradient-to-br from-white to-blue-50/50">
//               {/* Animated background pattern */}
//               <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
//                 <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-xl" />
//                 <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-cyan-400/5 to-transparent rounded-full blur-xl" />
//               </div>
              
//               <CardContent className="p-8 text-center relative z-10">
//                 {/* Animated icon with gradient border */}
//                 <div className="relative h-16 w-16 mx-auto mb-6">
//                   <div className="absolute inset-0 bg-gradient-to-br from-[#004AAD] to-cyan-500 rounded-2xl animate-[spinSlow_20s_linear_infinite] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
//                   <div className="absolute inset-2 bg-gradient-to-br from-[#004AAD] to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
//                     <item.icon className="h-8 w-8 text-white" />
//                   </div>
//                 </div>
                
//                 <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#004AAD] transition-colors duration-300">
//                   {item.title}
//                 </h3>
                
//                 <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
//                   {item.description}
//                 </p>
//               </CardContent>
              
//               {/* Animated bottom border */}
//               <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
//             </Card>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>

//   {/* Define custom animations */}
//   <div className="hidden">
//     <style>
//       {`
//       @keyframes fadeIn {
//         from {
//           opacity: 0;
//         }
//         to {
//           opacity: 1;
//         }
//       }
      
//       @keyframes badgePop {
//         0% {
//           opacity: 0;
//           transform: scale(0.8) rotate(-5deg);
//         }
//         80% {
//           transform: scale(1.1) rotate(2deg);
//         }
//         100% {
//           opacity: 1;
//           transform: scale(1) rotate(0);
//         }
//       }
      
//       @keyframes letterReveal {
//         0% {
//           opacity: 0;
//           transform: translateY(10px) rotateX(90deg);
//         }
//         100% {
//           opacity: 1;
//           transform: translateY(0) rotateX(0);
//         }
//       }
      
//       @keyframes underlineGrow {
//         0% {
//           width: 0;
//           opacity: 0;
//         }
//         100% {
//           width: 200px;
//           opacity: 1;
//         }
//       }
      
//       @keyframes slideInParagraph {
//         0% {
//           opacity: 0;
//           transform: translateX(50px);
//         }
//         100% {
//           opacity: 1;
//           transform: translateX(0);
//         }
//       }
      
//       @keyframes card3DAppear {
//         0% {
//           opacity: 0;
//           transform: translateY(30px) rotateX(10deg);
//         }
//         100% {
//           opacity: 1;
//           transform: translateY(0) rotateX(0);
//         }
//       }
      
//       @keyframes floatShape {
//         0% {
//           transform: translateY(0) rotate(0deg);
//         }
//         25% {
//           transform: translateY(-20px) translateX(10px) rotate(90deg);
//         }
//         50% {
//           transform: translateY(-40px) translateX(0) rotate(180deg);
//         }
//         75% {
//           transform: translateY(-20px) translateX(-10px) rotate(270deg);
//         }
//         100% {
//           transform: translateY(0) translateX(0) rotate(360deg);
//         }
//       }
      
//       @keyframes spinSlow {
//         from {
//           transform: rotate(0deg);
//         }
//         to {
//           transform: rotate(360deg);
//         }
//       }
      
//       @keyframes bounce {
//         0%, 100% {
//           transform: translateY(0);
//         }
//         50% {
//           transform: translateY(-10px);
//         }
//       }
//       `}
//     </style>
//   </div>
// </section>
//       {/* Timeline Section */}
//       <section className="py-20 -mt-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white relative overflow-hidden">
//   {/* Background animated orbs */}
//   <div className="absolute inset-0 overflow-hidden">
//     {/* Blue orbs */}
//     <div className="absolute top-20 left-10 w-12 h-12 bg-[#004AAD]/10 rounded-full animate-[orbFloat_15s_ease-in-out_infinite] blur-sm" />
//     <div className="absolute top-40 right-20 w-8 h-8 bg-blue-400/10 rounded-full animate-[orbFloat_12s_ease-in-out_infinite_reverse_2s] blur-sm" />
//     <div className="absolute bottom-32 left-1/4 w-10 h-10 bg-blue-300/20 rounded-full animate-[orbFloat_18s_ease-in-out_infinite_1s] blur-sm" />
    
//     {/* White orbs */}
//     <div className="absolute top-1/3 left-1/3 w-14 h-14 bg-white/20 rounded-full animate-[orbFloat_20s_ease-in-out_infinite_0.5s] blur-sm" />
//     <div className="absolute bottom-20 right-1/4 w-9 h-9 bg-white/30 rounded-full animate-[orbFloat_16s_ease-in-out_infinite_reverse_1.5s] blur-sm" />
//   </div>

//   <div className="container mx-auto px-4 relative z-10">
//     <div className="max-w-5xl mx-auto">
//       {/* Title section with unique animations */}
//       <div className="text-center mb-16 overflow-hidden">
//         <div className="inline-block mb-4 animate-[badgeRise_1s_ease-out_0.3s_forwards] opacity-0">
//           <Badge className="relative bg-gradient-to-r from-[#004AAD] via-blue-400 to-cyan-400 text-white border-0 px-6 py-2 shadow-lg overflow-hidden group">
//             <span className="relative z-10 font-semibold">Our Journey</span>
//             <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] via-blue-400 to-cyan-400 animate-[shimmerWave_3s_ease-in-out_infinite]" />
//           </Badge>
//         </div>
        
//         <h2 className="text-4xl md:text-5xl font-bold mb-4 overflow-hidden">
//           <div className="inline-block">
//             {"Milestones & Achievements".split("").map((letter, index) => (
//               <span
//                 key={index}
//                 className="inline-block opacity-0 animate-[letterWave_0.6s_ease-out_forwards]"
//                 style={{ 
//                   animationDelay: `${0.5 + (index * 0.03)}s`,
//                   color: letter === ' ' ? 'transparent' : '#1e293b'
//                 }}
//               >
//                 {letter}
//               </span>
//             ))}
//           </div>
//         </h2>
        
//         <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[textGlide_1s_ease-out_1.2s_forwards]">
//           From a single property to a trusted network across cities
//         </p>
//       </div>

//       {/* Timeline with unique animations */}
//       <div className="relative">
//         {/* Animated timeline line */}
//         <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-0 w-1 bg-gradient-to-b from-[#004AAD] via-blue-400 to-cyan-400 animate-[lineExtend_2s_ease-out_1.5s_forwards] overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent animate-[lightTrail_3s_linear_infinite]" />
//         </div>

//         {/* Milestones with unique animations */}
//         <div className="space-y-12">
//           {milestones.map((milestone, index) => (
//             <div 
//               key={index} 
//               className={`flex flex-col md:flex-row items-center gap-8 opacity-0 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
//               style={{
//                 animation: `cardReveal 0.8s ease-out ${1.8 + (index * 0.2)}s forwards`
//               }}
//             >
//               <div className="md:w-1/2">
//                 <Card className={`border-0 shadow-xl relative overflow-hidden group ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'} hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`}>
//                   {/* Animated gradient overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD]/5 via-blue-400/5 to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
//                   {/* Animated corner accents */}
//                   <div className="absolute top-0 left-0 w-16 h-1 bg-gradient-to-r from-[#004AAD] to-cyan-400 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
//                   <div className="absolute bottom-0 right-0 w-16 h-1 bg-gradient-to-r from-cyan-400 to-[#004AAD] transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  
//                   <CardContent className="p-8 relative z-10">
//                     {/* Year badge with unique animation */}
//                     <Badge className="mb-4 bg-gradient-to-r from-[#004AAD] to-cyan-500 text-white border-0 shadow-md relative overflow-hidden group-hover:shadow-lg transition-all duration-300">
//                       <span className="relative z-10">{milestone.year}</span>
//                       <div className="absolute inset-0 bg-gradient-to-r from-[#004AAD] to-cyan-500 animate-[gradientSlide_2s_ease-in-out_infinite]" />
//                     </Badge>
                    
//                     <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#004AAD] transition-colors duration-300">
//                       {milestone.title}
//                     </h3>
                    
//                     <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
//                       {milestone.description}
//                     </p>
//                   </CardContent>
                  
//                   {/* Floating indicator dots */}
//                   {/* <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full animate-[pulseDot_2s_ease-in-out_infinite]" />
//                   <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-[#004AAD] rounded-full animate-[pulseDot_2s_ease-in-out_infinite_0.5s]" /> */}
//                 </Card>
//               </div>
              
//               {/* Animated timeline node */}
//               <div className="hidden md:flex relative">
//                 <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#004AAD] to-cyan-500 shadow-xl z-10 animate-[nodeGlow_2s_ease-in-out_infinite] p-0.5 group">
//                   <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
//                     <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#004AAD] to-cyan-400 animate-[spinOrb_4s_linear_infinite]" />
//                   </div>
//                 </div>
                
//                 {/* Animated connection line */}
//                 <div className={`absolute top-1/2 w-8 h-0.5 bg-gradient-to-r ${index % 2 === 0 ? 'left-full from-[#004AAD]/50 via-cyan-400/50 to-transparent' : 'right-full from-transparent via-cyan-400/50 to-[#004AAD]/50'} opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:w-12`} />
//               </div>
              
//               <div className="md:w-1/2" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>

//   {/* Define unique animations */}
//   <div className="hidden">
//     <style>
//       {`
//       @keyframes badgeRise {
//         0% {
//           opacity: 0;
//           transform: translateY(20px) scale(0.9);
//         }
//         70% {
//           transform: translateY(-5px) scale(1.05);
//         }
//         100% {
//           opacity: 1;
//           transform: translateY(0) scale(1);
//         }
//       }
      
//       @keyframes shimmerWave {
//         0%, 100% {
//           background-position: -200% 0;
//         }
//         50% {
//           background-position: 200% 0;
//         }
//       }
      
//       @keyframes letterWave {
//         0% {
//           opacity: 0;
//           transform: translateY(20px) rotateX(90deg);
//         }
//         100% {
//           opacity: 1;
//           transform: translateY(0) rotateX(0);
//         }
//       }
      
//       @keyframes textGlide {
//         0% {
//           opacity: 0;
//           transform: translateX(-30px);
//         }
//         100% {
//           opacity: 1;
//           transform: translateX(0);
//         }
//       }
      
//       @keyframes lineExtend {
//         0% {
//           height: 0;
//         }
//         100% {
//           height: 100%;
//         }
//       }
      
//       @keyframes lightTrail {
//         0% {
//           transform: translateY(-100%);
//           opacity: 0;
//         }
//         50% {
//           opacity: 1;
//         }
//         100% {
//           transform: translateY(100%);
//           opacity: 0;
//         }
//       }
      
//       @keyframes cardReveal {
//         0% {
//           opacity: 0;
//           transform: ${'translateX(-40px) scale(0.95)'};
//         }
//         100% {
//           opacity: 1;
//           transform: translateX(0) scale(1);
//         }
//       }
      
//       @keyframes orbFloat {
//         0%, 100% {
//           transform: translate(0, 0) rotate(0deg);
//         }
//         33% {
//           transform: translate(20px, -30px) rotate(120deg);
//         }
//         66% {
//           transform: translate(-15px, 20px) rotate(240deg);
//         }
//       }
      
//       @keyframes orbFloat_reverse {
//         0%, 100% {
//           transform: translate(0, 0) rotate(0deg);
//         }
//         33% {
//           transform: translate(-20px, 30px) rotate(-120deg);
//         }
//         66% {
//           transform: translate(15px, -20px) rotate(-240deg);
//         }
//       }
      
//       @keyframes gradientSlide {
//         0%, 100% {
//           background-position: 0% 50%;
//         }
//         50% {
//           background-position: 100% 50%;
//         }
//       }
      
//       @keyframes pulseDot {
//         0%, 100% {
//           transform: scale(1);
//           opacity: 0.7;
//         }
//         50% {
//           transform: scale(1.5);
//           opacity: 1;
//         }
//       }
      
//       @keyframes nodeGlow {
//         0%, 100% {
//           box-shadow: 
//             0 0 20px rgba(0, 74, 173, 0.3),
//             0 0 40px rgba(6, 182, 212, 0.2);
//         }
//         50% {
//           box-shadow: 
//             0 0 30px rgba(0, 74, 173, 0.5),
//             0 0 60px rgba(6, 182, 212, 0.3);
//         }
//       }
      
//       @keyframes spinOrb {
//         0% {
//           transform: rotate(0deg) scale(1);
//         }
//         50% {
//           transform: rotate(180deg) scale(1.1);
//         }
//         100% {
//           transform: rotate(360deg) scale(1);
//         }
//       }
//       `}
//     </style>
//   </div>
// </section>
//       {/* Values Section */}
//       <section className="py-20 relative overflow-hidden">
//   {/* Background decorative elements */}
//   <div className="absolute inset-0 overflow-hidden">
//     <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-cyan-400/5 rounded-full animate-[float_8s_ease-in-out_infinite] blur-sm" />
//     <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-blue-400/5 to-white/10 rounded-full animate-[float_10s_ease-in-out_infinite_reverse_2s] blur-sm" />
//   </div>

//   <div className="container mx-auto px-4 relative z-10">
//     <div className="max-w-6xl mx-auto">
//       {/* Title section with zoom animations */}
//       <div className="text-center mb-16 overflow-hidden">
//         <div className="inline-block mb-4 animate-[zoomIn_0.8s_ease-out_0.2s_forwards] opacity-0 scale-50">
//           <div className="backdrop-blur-sm bg-white/30 rounded-full px-6 py-2 border border-white/50 shadow-lg">
//             <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-400/20 text-[#004AAD] border-0 px-4 py-1 backdrop-blur-sm">
//               Our Values
//             </Badge>
//           </div>
//         </div>
        
//         <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 overflow-hidden">
//           <div className="inline-block">
//             {"What Drives Us".split("").map((letter, index) => (
//               <span
//                 key={index}
//                 className="inline-block opacity-0 animate-[zoomLetter_0.6s_ease-out_forwards]"
//                 style={{ 
//                   animationDelay: `${0.6 + (index * 0.05)}s`,
//                   transformOrigin: 'center bottom'
//                 }}
//               >
//                 {letter}
//               </span>
//             ))}
//           </div>
//         </h2>
        
//         <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-[zoomIn_0.8s_ease-out_1.2s_forwards] scale-50">
//           The principles that guide everything we do
//         </p>
//       </div>

//       {/* Values grid with staggered zoom animations - SAME HEIGHT CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//         {values.map((value, index) => (
//           <div 
//             key={index} 
//             className="opacity-0 scale-95 animate-[zoomIn_0.8s_ease-out_forwards]"
//             style={{ animationDelay: `${1.5 + (index * 0.15)}s` }}
//           >
//             {/* Add h-full and min-h-[400px] for same height */}
//             <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:scale-105 h-full min-h-[400px]">
//               {/* Zoom effect overlay */}
//               <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-cyan-400/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              
//               {/* Zoom indicator ring */}
//               <div className="absolute top-4 right-4 h-8 w-8 border-2 border-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-150" />
              
//               {/* Add h-full to CardContent for proper height */}
//               <CardContent className="p-8 relative z-10 h-full">
//                 {/* Icon with double zoom effect */}
//                 <div className={`h-20 w-20 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-125 transition-all duration-500 relative overflow-hidden`}>
//                   {/* Inner zoom ring */}
//                   <div className="absolute inset-0 border-2 border-white/30 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:scale-90 transition-all duration-500" />
                  
//                   {/* Zoom focus effect */}
//                   <div className="absolute inset-4 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  
//                   <value.icon className="h-10 w-10 text-white relative z-10 group-hover:scale-110 transition-transform duration-500" />
//                 </div>
                
//                 {/* Title zoom effect */}
//                 <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-[#004AAD] transition-colors duration-300 transform group-hover:scale-105 origin-left">
//                   {value.title}
//                 </h3>
                
//                 {/* Text with subtle zoom - Add flex-grow for consistent height */}
//                 <p className="text-slate-600 leading-relaxed text-lg transform group-hover:scale-[1.02] transition-transform duration-500">
//                   {value.description}
//                 </p>
//               </CardContent>
              
//               {/* Zoom lines effect */}
//               <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
//             </Card>
//           </div>
//         ))}
//       </div>

//       {/* Bottom zoom callout */}
//       <div className="mt-16 text-center overflow-hidden">
//         <div 
//           className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/40 shadow-lg opacity-0 scale-95 animate-[zoomIn_0.8s_ease-out_forwards]"
//           style={{ animationDelay: '2.5s' }}
//         >
//           <div className="h-6 w-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center animate-[zoomPulse_2s_ease-in-out_infinite]">
//             <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </div>
//           <span className="text-lg text-slate-700 font-medium">
//             Living our values every day
//           </span>
//         </div>
//       </div>
//     </div>
//   </div>
//   {/* Define zoom animations */}
//   <div className="hidden">
//     <style>
//       {`
//       @keyframes zoomIn {
//         0% {
//           opacity: 0;
//           transform: scale(0.5);
//         }
//         70% {
//           transform: scale(1.05);
//         }
//         100% {
//           opacity: 1;
//           transform: scale(1);
//         }
//       }
      
//       @keyframes zoomLetter {
//         0% {
//           opacity: 0;
//           transform: scale(0.3) rotate(-10deg);
//         }
//         50% {
//           transform: scale(1.1) rotate(5deg);
//         }
//         100% {
//           opacity: 1;
//           transform: scale(1) rotate(0deg);
//         }
//       }
      
//       @keyframes zoomPulse {
//         0%, 100% {
//           transform: scale(1);
//           box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
//         }
//         50% {
//           transform: scale(1.1);
//         }
//         70% {
//           box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
//         }
//       }
      
//       @keyframes float {
//         0%, 100% {
//           transform: translateY(0) translateX(0) scale(1);
//         }
//         33% {
//           transform: translateY(-20px) translateX(10px) scale(1.05);
//         }
//         66% {
//           transform: translateY(10px) translateX(-10px) scale(0.95);
//         }
//       }
      
//       @keyframes float_reverse {
//         0%, 100% {
//           transform: translateY(0) translateX(0) scale(1);
//         }
//         33% {
//           transform: translateY(20px) translateX(-10px) scale(0.95);
//         }
//         66% {
//           transform: translateY(-10px) translateX(10px) scale(1.05);
//         }
//       }
//       `}
//     </style>
//   </div>
// </section>

//       {/* CTA Section */}
//       <section className="py-20 relative overflow-hidden bg-blue-900 text-white">
//         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl opacity-20" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

//         <div className="container mx-auto px-4 relative">
//           <div className="max-w-4xl mx-auto text-center">
//             <h2 className="text-4xl md:text-5xl font-bold mb-6">
//               Ready to Experience ROOMAC?
//             </h2>
//             <p className="text-xl text-white/90 mb-8 leading-relaxed">
//               Join our growing community and discover what makes ROOMAC the preferred choice for quality co-living
//             </p>
//             <div className="flex flex-wrap justify-center gap-4">
//               <Link href="/properties">
//                 <Button size="lg" className="bg-white text-[#004AAD] hover:bg-white/90 shadow-xl text-lg px-8">
//                   <Home className="mr-2 h-5 w-5" />
//                   Explore Properties
//                 </Button>
//               </Link>
//               <Link href="/contact">
//                 <Button size="lg" variant="outline" className="border-2 border-white text-blue-900 hover:bg-blue-200 text-lg px-8">
//                   Get in Touch
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import AboutClient from '@/components/about/AboutClient';
import { aboutPageData } from '@/components/about/constants';

async function getAboutData() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return aboutPageData;
}

export default function AboutPage() {
  const [data, setData] = useState<typeof aboutPageData | null>(null);
  useEffect(() => {
    getAboutData().then(setData);
  }, []);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }
  return <AboutClient data={data} />;
}