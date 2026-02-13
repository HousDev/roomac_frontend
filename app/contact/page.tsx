// "use client";

// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle, Headphones, MapPinned, Globe } from 'lucide-react';
// import { useState } from 'react';

// export default function ContactPage() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     subject: '',
//     propertyInterest: '',
//     message: '',
//   });

//   const [submitted, setSubmitted] = useState(false);
  
//   // FAQ states
//   const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setSubmitted(true);
//     setTimeout(() => {
//       setSubmitted(false);
//       setFormData({ name: '', email: '', phone: '', subject: '', propertyInterest: '', message: '' });
//     }, 3000);
//   };

//   const handleFaqToggle = (index: number) => {
//     setOpenFaqIndex(openFaqIndex === index ? null : index);
//   };

//   const contactMethods = [
//     {
//       icon: Phone,
//       title: "Call Us",
//       subtitle: "Mon-Sat, 9 AM - 7 PM",
//       value: "+91 98765 43210",
//       link: "tel:+919876543210",
//       color: "from-blue-500 to-cyan-500"
//     },
//     {
//       icon: Mail,
//       title: "Email Us",
//       subtitle: "24/7 Support",
//       value: "info@roomac.com",
//       link: "mailto:info@roomac.com",
//       color: "from-green-500 to-emerald-500"
//     },
//     {
//       icon: MessageSquare,
//       title: "WhatsApp",
//       subtitle: "Instant Response",
//       value: "+91 98765 43210",
//       link: "https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance",
//       color: "from-purple-500 to-pink-500"
//     }
//   ];

//   const officeLocations = [
//     {
//       city: "Pune",
//       address: "Hinjawadi Phase 1, Pune, Maharashtra 411057",
//       phone: "+91 98765 43210",
//       email: "pune@roomac.com"
//     },
//     {
//       city: "Mumbai",
//       address: "Andheri East, Mumbai, Maharashtra 400069",
//       phone: "+91 98765 43211",
//       email: "mumbai@roomac.com"
//     },
//     {
//       city: "Bangalore",
//       address: "Whitefield, Bangalore, Karnataka 560066",
//       phone: "+91 98765 43212",
//       email: "bangalore@roomac.com"
//     }
//   ];

//   const faqs = [
//     {
//       question: "How quickly will I get a response?",
//       answer: "We respond to all inquiries within 2-4 hours during business hours, and within 24 hours otherwise."
//     },
//     {
//       question: "Can I schedule a property visit?",
//       answer: "Yes! Fill out the form mentioning your preferred property and time, and we'll arrange a visit for you."
//     },
//     {
//       question: "Do you offer virtual tours?",
//       answer: "Absolutely! We provide video call tours for all our properties if you can't visit in person."
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
//       {/* Hero Section */}
//       <section className="relative overflow-hidden bg-gradient-to-br from-[#d2dae5] via-blue-100 to-cyan-100 text-white py-24">
//         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
//         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20" />
//         <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20" />

//         <div className="container mx-auto px-4 relative">
//           <div className="max-w-4xl mx-auto text-center">
//             {/* Badge - Built-in Tailwind animation */}
//             <div className="overflow-hidden">
//               <Badge 
//                 className="mb-6 bg-white backdrop-blur-md border-white/30 text-blue-600 hover:text-white hover:bg-blue-600 hover:border-blue-400 px-6 py-2 text-sm transition-all duration-300 hover:scale-105 animate-in slide-in-from-bottom-8 duration-800 delay-200 fill-mode-forwards"
//               >
//                 <Headphones className="h-3 w-3 mr-1" />
//                 24/7 Support Available
//               </Badge>
//             </div>
            
//             {/* Title - Built-in Tailwind animation */}
//             <div className="overflow-hidden">
//               <h1 
//                 className="text-5xl text-black md:text-6xl font-bold mb-6 leading-tight animate-in slide-in-from-bottom-12 duration-1000 delay-400 fill-mode-forwards zoom-in-95"
//               >
//                 Get in Touch
//               </h1>
//             </div>
            
//             {/* Paragraph - Built-in Tailwind animation */}
//             <div className="overflow-hidden">
//               <p 
//                 className="text-xl md:text-2xl text-black mb-8 leading-relaxed max-w-3xl mx-auto animate-[slideInLeft_0.8s_ease-out_0.6s_forwards] opacity-0 -translate-x-full"
//               >
//                 Have questions? We're here to help you find your perfect accommodation. Reach out through any channel that suits you best.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section> 

//       {/* Contact Methods */}
//       <section className="py-12 -mt-16 relative z-10">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
//             {contactMethods.map((method, index) => (
//               <a 
//                 key={index} 
//                 href={method.link} 
//                 target={method.link.startsWith('http') ? '_blank' : undefined} 
//                 rel="noopener noreferrer"
//                 className="block group"
//               >
//                 <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full hover:-translate-y-2">
//                   <CardContent className="p-6 text-center relative">
//                     {/* Icon container with hover effect */}
//                     <div 
//                       className={`h-16 w-16 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-lg relative overflow-hidden group-hover:scale-110`}
//                     >
//                       {/* Main icon */}
//                       <method.icon className="h-8 w-8 text-white relative z-10" />
                      
//                       {/* Action symbol overlay on hover */}
//                       <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                         {/* Call icon pe call symbol */}
//                         {method.title.toLowerCase().includes('call') && (
//                           <div className="bg-white rounded-full p-1.5 shadow-lg">
//                             <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                             </svg>
//                           </div>
//                         )}
                        
//                         {/* WhatsApp pe message symbol */}
//                         {method.title.toLowerCase().includes('whatsapp') && (
//                           <div className="bg-white rounded-full p-1.5 shadow-lg">
//                             <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                             </svg>
//                           </div>
//                         )}
                        
//                         {/* Email pe mail symbol */}
//                         {method.title.toLowerCase().includes('email') && (
//                           <div className="bg-white rounded-full p-1.5 shadow-lg">
//                             <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                             </svg>
//                           </div>
//                         )}
                        
//                         {/* Others pe arrow symbol */}
//                         {!method.title.toLowerCase().includes('call') && 
//                          !method.title.toLowerCase().includes('whatsapp') && 
//                          !method.title.toLowerCase().includes('email') && (
//                           <div className="bg-white rounded-full p-1.5 shadow-lg">
//                             <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                             </svg>
//                           </div>
//                         )}
//                       </div>
//                     </div>
                    
//                     <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-[#004AAD] transition-colors duration-300">
//                       {method.title}
//                     </h3>
//                     <p className="text-sm text-slate-500 mb-2">{method.subtitle}</p>
//                     <p className="text-sm font-semibold text-[#004AAD] group-hover:scale-105 transition-transform duration-300 inline-block">
//                       {method.value}
//                     </p>
                    
//                     {/* Bottom line effect */}
//                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-yellow-500 rounded-full group-hover:w-3/4 transition-all duration-500" />
//                   </CardContent>
//                 </Card>
//               </a>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <section className="py-20">
//         <div className="container mx-auto px-4">
//           <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Contact Form */}
//             <div className="lg:col-span-2">
//               <Card className="border-0 shadow-2xl">
//                 <CardContent className="p-8 md:p-12">
//                   <div className="mb-8">
//                     <h2 className="text-3xl font-bold text-slate-900 mb-2">Send us a Message</h2>
//                     <p className="text-slate-600">Fill out the form below and we'll get back to you within 24 hours</p>
//                   </div>

//                   {submitted ? (
//                     <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-12 text-center">
//                       <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
//                         <CheckCircle className="h-10 w-10 text-white" />
//                       </div>
//                       <h3 className="text-2xl font-bold text-green-800 mb-3">Message Sent Successfully!</h3>
//                       <p className="text-green-700 text-lg mb-6">We've received your message and will get back to you within 24 hours.</p>
//                       <Button onClick={() => setSubmitted(false)} className="bg-green-600 hover:bg-green-700">
//                         Send Another Message
//                       </Button>
//                     </div>
//                   ) : (
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
//                           <Input
//                             id="name"
//                             required
//                             placeholder="John Doe"
//                             value={formData.name}
//                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                             className="h-12 mt-2"
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="phone" className="text-sm font-semibold">Phone Number *</Label>
//                           <Input
//                             id="phone"
//                             type="tel"
//                             required
//                             placeholder="+91 98765 43210"
//                             value={formData.phone}
//                             onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                             className="h-12 mt-2"
//                           />
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="email" className="text-sm font-semibold">Email Address *</Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           required
//                           placeholder="john@example.com"
//                           value={formData.email}
//                           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                           className="h-12 mt-2"
//                         />
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                           <Label htmlFor="subject" className="text-sm font-semibold">Subject *</Label>
//                           <Input
//                             id="subject"
//                             required
//                             placeholder="Property Inquiry"
//                             value={formData.subject}
//                             onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//                             className="h-12 mt-2"
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="property" className="text-sm font-semibold">Property Interest</Label>
//                           <Select value={formData.propertyInterest} onValueChange={(value) => setFormData({ ...formData, propertyInterest: value })}>
//                             <SelectTrigger className="h-12 mt-2">
//                               <SelectValue placeholder="Select property" />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="hinjawadi">ROOMAC Hinjawadi Premium</SelectItem>
//                               <SelectItem value="wakad">ROOMAC Wakad Elite</SelectItem>
//                               <SelectItem value="baner">ROOMAC Baner Comfort</SelectItem>
//                               <SelectItem value="other">Other / General Inquiry</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>

//                       <div>
//                         <Label htmlFor="message" className="text-sm font-semibold">Message *</Label>
//                         <Textarea
//                           id="message"
//                           rows={6}
//                           required
//                           placeholder="Tell us about your requirements, preferred location, budget, and any questions you have..."
//                           value={formData.message}
//                           onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                           className="mt-2"
//                         />
//                       </div>

//                       <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-[#06326b] to-blue-700 hover:from-[#003580] hover:to-blue-500 shadow-lg text-lg h-14">
//                         <Send className="mr-2 h-5 w-5" />
//                         Send Message
//                       </Button>

//                       <p className="text-sm text-slate-500 text-center">
//                         By submitting this form, you agree to our privacy policy and terms of service
//                       </p>
//                     </form>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               {/* Office Hours */}
//               <Card className="border-0 shadow-xl">
//                 <CardContent className="p-6">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="h-12 w-12 bg-gradient-to-br from-[#004AAD] to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
//                       <Clock className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-lg text-slate-900">Office Hours</h3>
//                       <p className="text-sm text-slate-600">Visit us anytime</p>
//                     </div>
//                   </div>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between py-2 border-b">
//                       <span className="font-medium text-slate-700">Monday - Friday</span>
//                       <span className="text-slate-900 font-semibold">9 AM - 7 PM</span>
//                     </div>
//                     <div className="flex justify-between py-2 border-b">
//                       <span className="font-medium text-slate-700">Saturday</span>
//                       <span className="text-slate-900 font-semibold">10 AM - 6 PM</span>
//                     </div>
//                     <div className="flex justify-between py-2">
//                       <span className="font-medium text-slate-700">Sunday</span>
//                       <span className="text-slate-900 font-semibold">10 AM - 5 PM</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Office Locations */}
//               <Card className="border-0 shadow-xl">
//                 <CardContent className="p-6">
//                   <div className="flex items-center gap-3 mb-6">
//                     <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
//                       <MapPinned className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-lg text-slate-900">Our Offices</h3>
//                       <p className="text-sm text-slate-600">Multiple locations</p>
//                     </div>
//                   </div>
//                   <div className="space-y-4">
//                     {officeLocations.map((location, index) => (
//                       <div key={index} className="pb-4 border-b last:border-0">
//                         <h4 className="font-bold text-slate-900 mb-2">{location.city}</h4>
//                         <p className="text-sm text-slate-600 mb-2">{location.address}</p>
//                         <div className="flex flex-col gap-1 text-xs">
//                           <a href={`tel:${location.phone}`} className="text-[#004AAD] hover:underline">{location.phone}</a>
//                           <a href={`mailto:${location.email}`} className="text-[#004AAD] hover:underline">{location.email}</a>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Quick Response Card */}
//               <Card className="border-0 shadow-xl overflow-hidden">
//                 <div className="bg-gradient-to-br from-[#004AAD] via-blue-600 to-cyan-600 p-6 text-white">
//                   <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
//                     <MessageSquare className="h-6 w-6" />
//                   </div>
//                   <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
//                   <p className="text-white/90 mb-4 text-sm">
//                     For urgent queries, reach us directly via WhatsApp or call us. We're always ready to assist you!
//                   </p>
//                   <a href="https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance" target="_blank" rel="noopener noreferrer">
//                     <Button className="w-full bg-white text-[#004AAD] hover:bg-white/90 shadow-lg">
//                       <MessageSquare className="mr-2 h-4 w-4" />
//                       Chat on WhatsApp
//                     </Button>
//                   </a>
//                 </div>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="py-20 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="text-center mb-12">
//               <Badge className="mb-4 bg-blue-100 text-[#004AAD] border-0 px-4 py-1">
//                 FAQ
//               </Badge>
//               <h2 className="text-4xl font-bold text-slate-900 mb-4">
//                 Frequently Asked Questions
//               </h2>
//               <p className="text-xl text-slate-600">
//                 Quick answers to common questions
//               </p>
//             </div>

//             <div className="space-y-4">
//               {faqs.map((faq, index) => (
//                 <Card 
//                   key={index} 
//                   className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer"
//                   onClick={() => handleFaqToggle(index)}
//                 >
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <h3 className="font-bold text-lg text-slate-900 pr-4">
//                         {faq.question}
//                       </h3>
//                       <div className="flex-shrink-0">
//                         {openFaqIndex === index ? (
//                           <svg 
//                             className="h-5 w-5 text-[#004AAD] transition-transform duration-300 rotate-180" 
//                             fill="none" 
//                             viewBox="0 0 24 24" 
//                             stroke="currentColor"
//                           >
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
//                           </svg>
//                         ) : (
//                           <svg 
//                             className="h-5 w-5 text-[#004AAD] transition-transform duration-300" 
//                             fill="none" 
//                             viewBox="0 0 24 24" 
//                             stroke="currentColor"
//                           >
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         )}
//                       </div>
//                     </div>
                    
//                     {/* Answer with slide animation */}
//                     <div 
//                       className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                         openFaqIndex === index 
//                           ? 'mt-4 opacity-100 max-h-96' 
//                           : 'mt-0 opacity-0 max-h-0'
//                       }`}
//                     >
//                       <p className="text-slate-600 pt-2 border-t border-slate-100">
//                         {faq.answer}
//                       </p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import ContactClient from '@/components/contact/client';
import ContactLoading from '@/components/contact/loading';
import { ContactPageData } from '@/components/contact/types';

// Server-side data fetching function
async function getContactData(): Promise<ContactPageData> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // In a real app, this would fetch from an API
  return {
    contactMethods: [
      {
        icon: 'Phone', // ✅ Changed to string
        title: "Call Us",
        subtitle: "Mon-Sat, 9 AM - 7 PM",
        value: "+91 99239 53933",
        link: "tel:+919923953933",
        color: "from-yellow-500 to-yellow-500"
      },
      {
        icon: 'Mail', // ✅ Changed to string
        title: "Email Us",
        subtitle: "24/7 Support",
        value: "stay@roomac.com",
        link: "mailto:stay@roomac.com",
        color: "from-green-500 to-emerald-500"
      },
      {
        icon: 'MessageSquare', // ✅ Changed to string
        title: "WhatsApp",
        subtitle: "Instant Response",
        value: "+91 99239 53933",
        link: "https://wa.me/919876543210?text=Hi%20ROOMAC,%20I%20need%20assistance",
        color: "from-purple-500 to-pink-500"
      }
    ],
    officeLocations: [
      {
        city: "Pune",
        address: "Near Indira College, Wakad, Pune, Maharashtra 411057",
        phone: "+91 9923953933",
        email: "stay@roomac.com"
      },
      // {
      //   city: "Mumbai",
      //   address: "Andheri East, Mumbai, Maharashtra 400069",
      //   phone: "+91 98765 43211",
      //   email: "mumbai@roomac.com"
      // },
      // {
      //   city: "Bangalore",
      //   address: "Whitefield, Bangalore, Karnataka 560066",
      //   phone: "+91 98765 43212",
      //   email: "bangalore@roomac.com"
      // }
    ],
    faqs: [
      {
        question: "How quickly will I get a response?",
        answer: "We respond to all inquiries within 2-4 hours during business hours, and within 24 hours otherwise."
      },
      {
        question: "Can I schedule a property visit?",
        answer: "Yes! Fill out the form mentioning your preferred property and time, and we'll arrange a visit for you."
      },
      {
        question: "Do you offer virtual tours?",
        answer: "Absolutely! We provide video call tours for all our properties if you can't visit in person."
      }
    ]
  };
}

export default function ContactPage() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getContactData>> | null>(null);
  useEffect(() => {
    getContactData().then(setData);
  }, []);
  if (!data) return <ContactLoading />;
  return <ContactClient data={data} />;
}

// Generate metadata for SEO
export const metadata = {
  title: 'Contact Us | ROOMAC',
  description: 'Get in touch with ROOMAC for property inquiries, support, and accommodation assistance.',
  keywords: ['contact', 'support', 'property inquiry', 'accommodation', 'ROOMAC'],
};