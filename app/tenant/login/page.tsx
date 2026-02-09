// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
// import { toast } from "sonner";
// import { Mail, Lock, Home, ArrowRight, ChevronDown, User, CheckCircle, Sparkles } from "lucide-react";
// import { listProperties, type Property } from "@/lib/propertyApi";

// import { 
//   loginTenant, 
//   sendTenantOTP, 
//   verifyTenantOTP,
//   type TenantLoginResponse 
// } from "@/lib/tenantAuthApi";

// export default function TenantLoginPage() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);
//   const [generatedOtp, setGeneratedOtp] = useState("");
//   const [rememberMe, setRememberMe] = useState(false);
//   const [showAccounts, setShowAccounts] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [propertyImages, setPropertyImages] = useState<string[]>([]);
//   const [exitAnimation, setExitAnimation] = useState(false);
//   const [slideDirection, setSlideDirection] = useState("");

//   useEffect(() => {
//     async function fetchPropertyImages() {
//       try {
//         const res = await listProperties({ page: 1, pageSize: 4, is_active: true });

//         if (res.success && res.data?.data?.length) {
//           const images: string[] = res.data.data
//             .map((p: Property) => p.photo_urls?.[0])
//             .filter(Boolean);

//           while (images.length < 4) {
//             images.push("https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+Image");
//           }

//           setPropertyImages(images.slice(0, 4));
//         } else {
//           setPropertyImages([
//             "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+1",
//             "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Default+2",
//             "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Default+3",
//             "https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Default+4",
//           ]);
//         }
//       } catch (error) {
//         console.error(error);
//         setPropertyImages([
//           "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+1",
//           "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Default+2",
//           "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Default+3",
//           "https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Default+4",
//         ]);
//       }
//     }

//     fetchPropertyImages();
//   }, []);

//   const [credentials, setCredentials] = useState({
//     email: "",
//     password: ""
//   });

//   const [otpData, setOtpData] = useState({
//     email: "",
//     otp: ""
//   });

//   const handleSuccessfulLogin = () => {
//     // Set diagonal slide direction (right-bottom to left-top)
//     setSlideDirection("slide-out-right-bottom");
//     setExitAnimation(true);
    
//     // Show confirmation after animation starts
//     setTimeout(() => {
//       setShowConfirmation(true);
//     }, 300);
    
//     // Redirect after everything completes
//     setTimeout(() => {
//       router.push("/tenant/portal");
//     }, 2500);
//   };

//   const handlePasswordLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const result: TenantLoginResponse = await loginTenant(credentials.email, credentials.password);

//       if (result.success && result.token) {
//         if (rememberMe) {
//           localStorage.setItem("tenant_token", result.token);
//         } else {
//           sessionStorage.setItem("tenant_token", result.token);
//         }

//         handleSuccessfulLogin();
//       } else {
//         toast.error(result.error || result.message || "Invalid credentials");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Login failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!otpData.email) {
//       toast.error("Please enter your email");
//       return;
//     }

//     setLoading(true);
//     try {
//       const result: TenantLoginResponse = await sendTenantOTP(otpData.email);

//       if (result.success) {
//         setOtpSent(true);
//         setGeneratedOtp(result.otp || "123456");
//         toast.success(`OTP sent! For testing: ${result.otp}`);
//       } else {
//         toast.error(result.error || result.message || "Failed to send OTP");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const result: TenantLoginResponse = await verifyTenantOTP(otpData.email, otpData.otp);

//       if (result.success && result.token) {
//         if (rememberMe) {
//           localStorage.setItem("tenant_token", result.token);
//         } else {
//           sessionStorage.setItem("tenant_token", result.token);
//         }

//         handleSuccessfulLogin();
//       } else {
//         toast.error(result.error || result.message || "Invalid OTP");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuickLogin = (email: string, password: string) => {
//     setCredentials({ email, password });
//     setShowAccounts(false);
//     toast.success("Credentials loaded! Now click Login button");
//   };

//   const testAccounts = [
//     { 
//       name: "Amit Sharma", 
//       email: "amit.sharma@example.com", 
//       password: "password123",
//       avatar: "AS",
//       color: "from-blue-500 to-blue-600"
//     },
//     { 
//       name: "Priya Singh", 
//       email: "priya.singh@example.com", 
//       password: "password123",
//       avatar: "PS",
//       color: "from-pink-500 to-pink-600"
//     },
//     { 
//       name: "Rahul Verma", 
//       email: "rahul.verma@example.com", 
//       password: "password123",
//       avatar: "RV",
//       color: "from-purple-500 to-purple-600"
//     }
//   ];

//   const imageUrls = [
//     "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop&crop=center",
//     "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop&crop=center",
//     "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop&crop=center",
//     "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&h=300&fit=crop&crop=center"
//   ];

//   // If showing confirmation, show only confirmation screen
//   if (showConfirmation) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-500 to-blue-500 overflow-hidden">
//         {/* Background Effects */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
//         </div>

//         {/* Confirmation Content */}
//         <div className="relative z-10 text-center text-white space-y-8 max-w-2xl px-6 animate-in zoom-in duration-700">
//           {/* Animated Checkmark with Sparkles */}
//           <div className="relative mx-auto w-40 h-40">
//             <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-ping-slow"></div>
//             <div className="relative">
//               <CheckCircle className="w-full h-full animate-in zoom-in duration-1000" strokeWidth={1} />
//               <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-300 animate-spin-slow" />
//               <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-300 animate-spin-slow delay-300" />
//             </div>
//           </div>
          
//           {/* Success Message */}
//           <div className="space-y-4">
//             <h1 className="text-5xl md:text-6xl font-bold tracking-tight animate-in slide-in-from-bottom duration-700 delay-300">
//               Login Successful! 🎉
//             </h1>
//             <div className="h-1 w-32 bg-white/50 rounded-full mx-auto animate-in slide-in-from-bottom duration-700 delay-500"></div>
//             <p className="text-xl md:text-2xl text-white/90 animate-in slide-in-from-bottom duration-700 delay-700">
//               Welcome back to Roomac Portal
//             </p>
//             <p className="text-lg text-white/80 animate-in slide-in-from-bottom duration-700 delay-900">
//               Redirecting to your dashboard...
//             </p>
//           </div>
          
//           {/* Animated Progress Bar */}
//           <div className="pt-8 animate-in fade-in duration-1000 delay-1100">
//             <div className="w-64 md:w-80 h-3 bg-white/30 rounded-full overflow-hidden mx-auto">
//               <div 
//                 className="h-full bg-gradient-to-r from-white to-yellow-200 rounded-full animate-progress"
//                 style={{ animationDuration: '2s' }}
//               ></div>
//             </div>
//             <div className="flex justify-between text-sm mt-2 text-white/70">
//               <span>Redirecting in</span>
//               <span className="font-bold">2 seconds</span>
//             </div>
//           </div>

//           {/* Decorative Elements */}
//           <div className="flex justify-center gap-4 pt-6">
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
//             <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
//           </div>
//         </div>

//         {/* Bottom Wave Effect */}
//         <div className="absolute bottom-0 left-0 right-0">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
//             <path fill="#ffffff" fillOpacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
//           </svg>
//         </div>
//       </div>
//     );
//   }

//   // Normal Login Page with exit animation
//   return (
//     <div className={`h-screen flex overflow-hidden bg-white relative ${
//       exitAnimation ? "overflow-hidden" : ""
//     }`}>
//       {/* Left Side - Image Gallery with Exit Animation */}
//       <div className={`hidden lg:flex lg:w-1/2 relative overflow-hidden transition-all duration-500 ${
//         exitAnimation ? 
//           slideDirection === "slide-out-right-bottom" ? 
//             "-translate-x-[100%] -translate-y-[100%] rotate-[-45deg] opacity-0 scale-75" 
//             : "" 
//           : ""
//       }`}>
//         {/* Animated Gradient Background */}
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500 animate-gradient"></div>
        
//         {/* Decorative Animated Circles */}
//         <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20 blur-3xl animate-float"></div>
//         <div className="absolute bottom-40 right-10 w-24 h-24 bg-yellow-300 rounded-full opacity-30 blur-2xl animate-float-delayed"></div>
//         <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-pink-400 rounded-full opacity-25 blur-xl animate-pulse"></div>
//         <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-400 rounded-full opacity-20 blur-2xl animate-float"></div>
        
//         {/* Curved Overlay */}
//         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
//         <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/5 rounded-full blur-3xl transform -translate-x-40 translate-y-40"></div>
        
//         <div className="relative w-full h-full flex flex-col justify-between p-12">
//           {/* Top Icon with Animation */}
//           <div className="mb-4 animate-in fade-in slide-in-from-top duration-500">
//           </div>

//           {/* Fixed Image Grid */}
//           <div className="grid grid-cols-2 grid-rows-2 gap-6 flex-shrink-0 mb-6 h-80">
//             {/* Image 1 - Top Left */}
//             <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in delay-100 -rotate-1">
//               <img 
//                 src={imageUrls[0]}
//                 alt="Modern Apartment"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Modern+Apartment`;
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-transparent to-blue-600/30"></div>
//               <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-purple-600 text-xs font-bold">1</span>
//               </div>
//             </div>

//             {/* Image 2 - Top Right */}
//             <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in delay-200 rotate-1">
//               <img 
//                 src={imageUrls[1]}
//                 alt="Luxury Bedroom"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = `https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Luxury+Bedroom`;
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-bl from-blue-600/30 via-transparent to-purple-600/30"></div>
//               <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-blue-600 text-xs font-bold">2</span>
//               </div>
//             </div>

//             {/* Image 3 - Bottom Left */}
//             <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in delay-300 -rotate-1">
//               <img 
//                 src={imageUrls[2]}
//                 alt="Spacious Living"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = `https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Spacious+Living`;
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/30 via-transparent to-purple-600/30"></div>
//               <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-pink-600 text-xs font-bold">3</span>
//               </div>
//             </div>

//             {/* Image 4 - Bottom Right */}
//             <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 animate-in fade-in zoom-in delay-400 rotate-1">
//               <img 
//                 src={imageUrls[3]}
//                 alt="Cozy Interior"
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.currentTarget.src = `https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Cozy+Interior`;
//                 }}
//               />
//               <div className="absolute inset-0 bg-gradient-to-tl from-purple-600/30 via-transparent to-blue-600/30"></div>
//               <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg">
//                 <span className="text-purple-600 text-xs font-bold">4</span>
//               </div>
//             </div>
//           </div>

//           {/* Welcome Text Section */}
//           <div className="text-center text-white space-y-4 mt-8 mb-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
//             <div className="relative inline-block">
//               <h1 className="text-5xl font-bold leading-tight relative z-10">
//                 Welcome To <br />Roomac
//               </h1>
//               <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full transform scale-150"></div>
//             </div>
//             <p className="text-sm text-blue-100 leading-relaxed font-medium">
//               Manage your stay, connect housemates,<br />and discover community events.
//             </p>
            
//             {/* Animated Pagination Dots */}
//             <div className="flex justify-center gap-2 pt-3">
//               <div className="w-10 h-1.5 rounded-full bg-white shadow-lg animate-pulse"></div>
//               <div className="w-1.5 h-1.5 rounded-full bg-white/40 my-auto"></div>
//               <div className="w-1.5 h-1.5 rounded-full bg-white/40 my-auto"></div>
//             </div>
//           </div>
//         </div>
//         {/* Animated Gradient Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
//       </div>

//       {/* Right Side - Login Form with Exit Animation */}
//       <div className={`flex-1 flex items-center justify-center p-6 bg-white relative transition-all duration-500 ${
//         exitAnimation ? 
//           slideDirection === "slide-out-right-bottom" ? 
//             "translate-x-[100%] -translate-y-[100%] rotate-[45deg] opacity-0 scale-50" 
//             : "" 
//           : ""
//       }`}>
//         <div className="w-full max-w-md flex flex-col justify-center">
//           {/* Header */}
//           <div className="text-center mb-6">
//             <h2 className="relative text-4xl md:text-5xl font-serif font-extrabold tracking-wide text-blue-900 text-center">
//               Tenant Login
//               {/* Left underline */}
//               <span className="absolute -bottom-2 left-0 w-20 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
//               {/* Right underline */}
//               <span className="absolute -bottom-2 right-0 w-20 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
//             </h2>
//             <p className="text-xs text-gray-500 mt-1">
//               Access your personalized portal
//             </p>
//           </div>

//           {/* ===== FLOATING LOGIN CARD ===== */}
//           <div
//             className={`relative bg-white
//               rounded-[30px] rounded-tr-[100px] rounded-bl-[100px]
//               p-7 border border-gray-200
//               shadow-[0_30px_60px_rgba(0,0,0,0.20)]
//               hover:shadow-[0_45px_90px_rgba(0,0,0,0.25)]
//               transition-all duration-300
//               overflow-hidden ${
//                 exitAnimation ? "animate-out fade-out-50 slide-out-to-bottom" : ""
//               }`}
//           >
//             {/* inner depth */}
//             <div className="absolute inset-0 rounded-[30px] pointer-events-none
//               shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]" />

//             <form
//               onSubmit={handlePasswordLogin}
//               className="space-y-4 relative z-10"
//             >
//               {/* Email */}
//               <div>
//                 <Label className="text-sm font-semibold text-black">
//                   Email
//                 </Label>
//                 <div className="relative mt-1">
//                   <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
//                   <Input
//                     type="email"
//                     placeholder="Enter your email"
//                     value={credentials.email}
//                     onChange={(e) =>
//                       setCredentials({ ...credentials, email: e.target.value })
//                     }
//                     className="h-11 rounded-full text-sm
//                       bg-blue-50 border border-gray-300
//                       focus:border-blue-500 focus:ring-4 focus:ring-blue-100
//                       pr-11 transition"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <Label className="text-sm font-semibold text-black">
//                   Password
//                 </Label>
//                 <div className="relative mt-1">
//                   <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
//                   <Input
//                     type="password"
//                     placeholder="Enter your password"
//                     value={credentials.password}
//                     onChange={(e) =>
//                       setCredentials({ ...credentials, password: e.target.value })
//                     }
//                     className="h-11 rounded-full text-sm
//                       bg-blue-50 border border-gray-300
//                       focus:border-blue-500 focus:ring-4 focus:ring-blue-100
//                       pr-11 transition"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Remember + Forgot */}
//               <div className="flex justify-between items-center text-xs">
//                 <div className="flex items-center gap-2">
//                   <Checkbox
//                     checked={rememberMe}
//                     onCheckedChange={(c) => setRememberMe(c as boolean)}
//                     className="h-4 w-4 rounded border-gray-300"
//                   />
//                   <span className="text-gray-600">Remember me</span>
//                 </div>
//                 <button
//                   type="button"
//                   className="text-blue-600 hover:text-blue-700 font-medium"
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               {/* ===== PREMIUM LOGIN BUTTON ===== */}
//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full h-12 rounded-full
//                   bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
//                   hover:from-blue-700 hover:to-blue-700
//                   text-white font-bold tracking-wide
//                   active:scale-[0.97]
//                   transition-all relative overflow-hidden group"
//               >
//                 {/* Shine effect on button */}
//                 <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
//                 {loading ? "Logging in..." : "LOGIN"}
//               </Button>
//             </form>

//             {/* OTP */}
//             <div className="mt-5 relative z-10">
//               {!otpSent ? (
//                 <form onSubmit={handleSendOTP}>
//                   <Button
//                     type="submit"
//                     variant="outline"
//                     className="w-full h-11 rounded-full
//                       border-purple-300 text-purple-700
//                       hover:bg-blue-600 hover:text-white
//                       shadow-sm hover:shadow-md transition"
//                   >
//                     <Mail className="w-4 h-4 mr-2" />
//                     Login with OTP
//                   </Button>
//                 </form>
//               ) : (
//                 <form
//                   onSubmit={handleVerifyOTP}
//                   className="mt-3 p-4 rounded-2xl
//                     border border-purple-200 bg-purple-50 space-y-2"
//                 >
//                   <Input
//                     placeholder="Enter 6-digit OTP"
//                     value={otpData.otp}
//                     onChange={(e) =>
//                       setOtpData({ ...otpData, otp: e.target.value })
//                     }
//                     className="h-9 rounded-full text-xs
//                       focus:ring-4 focus:ring-purple-200"
//                     maxLength={6}
//                     required
//                   />
//                   <p className="text-[10px] text-purple-600">
//                     Test OTP: {generatedOtp}
//                   </p>
//                   <Button
//                     type="submit"
//                     className="w-full h-9 rounded-full
//                       bg-purple-600 hover:bg-purple-700 text-white"
//                   >
//                     Verify OTP
//                   </Button>
//                 </form>
//               )}
//             </div>

//             {/* Divider */}
//             <div className="my-5 relative z-10">
//               <div className="border-t border-gray-200" />
//               <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-[10px] text-gray-500">
//                 OR
//               </span>
//             </div>

//             {/* ===== GOOGLE SIGN IN ===== */}
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-11 rounded-full
//                 border-gray-300 bg-white
//                 flex items-center justify-center gap-3
//                 hover:bg-blue-100 hover:text-black
//                 shadow-sm hover:shadow-md transition-all"
//               onClick={() => toast.info("Google sign-in coming soon")}
//             >
//               <svg className="w-5 h-5" viewBox="0 0 24 24">
//                 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
//                 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//               </svg>
//               Sign in with Google
//             </Button>

//             {/* Footer */}
//             <div className="text-center mt-4 text-xs">
//               <p className="text-gray-600">
//                 New tenant?{" "}
//                 <span className="text-blue-600 font-semibold cursor-pointer">
//                   Create Account
//                 </span>
//               </p>
//               <button
//                 onClick={() => router.push("/")}
//                 className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-700"
//               >
//                 ← Back to Home
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Diagonal Slide Animation Overlay */}
//       {exitAnimation && (
//         <>
//           {/* Particle Effects */}
//           <div className="absolute inset-0 pointer-events-none">
//             {[...Array(20)].map((_, i) => (
//               <div
//                 key={i}
//                 className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
//                 style={{
//                   left: `${Math.random() * 100}%`,
//                   top: `${Math.random() * 100}%`,
//                   animationDelay: `${i * 0.1}s`,
//                   opacity: 0.7,
//                 }}
//               />
//             ))}
//           </div>
          
//           {/* Diagonal Trail Effect */}
//           <div className="absolute inset-0 pointer-events-none">
//             <div className="absolute w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 animate-pulse"
//               style={{
//                 transform: 'rotate(-45deg)',
//                 top: '50%',
//                 left: '-50%',
//                 animationDuration: '1s',
//               }}
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { listProperties } from "@/lib/propertyApi";
import LoginClient from "@/components/tenant/login/LoginClient";
import LoadingSkeleton from "@/components/tenant/login/loading-skeleton";

export default function TenantLoginPage() {
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPropertyImages().then(setPropertyImages).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  return <LoginClient initialPropertyImages={propertyImages} />;
}

async function fetchPropertyImages() {
  try {
    const res = await listProperties({ page: 1, pageSize: 4, is_active: true });

    if (res.success && res.data?.data?.length) {
      const images: string[] = res.data.data
        .map((p: any) => p.photo_urls?.[0])
        .filter(Boolean);

      while (images.length < 4) {
        images.push("https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+Image");
      }

      return images.slice(0, 4);
    }
  } catch (error) {
    console.error("Failed to fetch property images:", error);
  }

  // Return default images on error
  return [
    "https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Default+1",
    "https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Default+2",
    "https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Default+3",
    "https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Default+4",
  ];
}