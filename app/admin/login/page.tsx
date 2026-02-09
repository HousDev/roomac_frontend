// "use client";

// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Building2, Lock, Mail, AlertCircle, ArrowLeftCircle, } from 'lucide-react';
// import { useState } from 'react';
// import { useRouter } from '@/src/compat/next-navigation';
// import { loginAdmin } from '@/lib/api';
// import { useAuth } from '../../../context/authContext';
// import { toast } from "sonner"; // ✅ ADDED
// import Link from 'next/link';

// export default function AdminLoginPage() {
//   const router = useRouter();
//   const { login } = useAuth();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const data = await loginAdmin(email.trim(), password);

//       if (!data || !data.success) {
//         const msg = data?.message || 'Invalid email or password';
//         setError(msg);
//         toast.error(msg); // ❌ ERROR TOAST
//         setLoading(false);
//         return;
//       }

//       // ✅ Update auth context
//       if (data.token && data.user?.email) {
//         login(data.user.email, data.token);
//       } else if (data.user?.email) {
//         login(data.user.email, localStorage.getItem('admin_token') || '');
//       }

//       // ✅ SUCCESS TOAST
//       toast.success("Login successful 🎉");

//       router.push('/admin/dashboard');
//     } catch (err: any) {
//       console.error('Login error:', err);
//       const msg = err?.message || 'Something went wrong. Please try again.';
//       setError(msg);
//       toast.error(msg); // ❌ ERROR TOAST
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-4">
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDRBQUQiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNi42MjcgNS4zNzMtMTIgMTItMTJzMTIgNS4zNzMgMTIgMTItNS4zNzMgMTItMTIgMTItMTItNS4zNzMtMTItMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

//       <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
//         <CardHeader className="space-y-4 pb-8">
//           <div className="flex justify-center">
//             <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
//               <Building2 className="h-8 w-8 text-white" />
//             </div>
//           </div>
//           <div className="text-center">
//             <CardTitle className="text-3xl font-bold">ROOMAC Admin</CardTitle>
//             <CardDescription className="text-base mt-2">
//               Sign in to access the admin dashboard
//             </CardDescription>
//           </div>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-6">
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
//                 <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
//                 <p className="text-sm text-red-800">{error}</p>
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   className="pl-10 h-12"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="pl-10 h-12"
//                 />
//               </div>

//             </div>

//             <Button type="submit" disabled={loading} className="w-full h-12">
//               {loading ? "Signing In..." : "Sign In"}
//             </Button>

           
// <div className="mt-6 text-center">
//   <Link 
//     href="/" 
//     className="inline-flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
//   >
//     <ArrowLeftCircle className="h-4 w-4" />
//     Back to Home
//   </Link>
// </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from '@/src/compat/next-navigation';
import { loginAdmin } from '@/lib/api';
import { useAuth } from '../../../context/authContext';
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginAdmin(email.trim(), password);

      if (!data || !data.success || !data.user || !data.token) {
        const msg = data?.message || 'Invalid email or password';
        setError(msg);
        toast.error(msg);
        return;
      }

      login(data.user.email, data.token);
      toast.success("Login successful 🎉");
      console.log("Admin logged in:", data.user.email);
      console.log("redirecting to dashboard...");
      router.push('/admin/dashboard');
      console.log("Redirected to /admin/dashboard");
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 flex">
        <div className="hidden md:block w-1/2 bg-[#1f5ea8] relative rounded-r-[60px] ">
        
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="w-full md:w-1/2 bg-white" />
      </div>

      {/* CARD */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-white/20 bg-gradient-to-br from-[#244aa5] to-[#5988e8] text-white">
          <CardContent className="p-8">
            
            {/* HEADER */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-semibold">
                ROOMAC Admin
              </h1>
              <p className="text-sm  text-white/80 mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/20 p-3 text-sm text-white">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                {error}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* EMAIL */}
              <div>
                <Label className="text-white/90">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                  <Input
                    type="email"
                    placeholder="admin@roomac.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-white/90 text-black"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <Label className="text-white/90">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-white/90 text-black"
                    required
                  />
                </div>
              </div>

              {/* SIGN IN BUTTON */}
              <Button
  type="submit"
  disabled={loading}
  className="w-full h-11 bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3"
>
  <span>{loading ? "Signing in..." : "Sign In"}</span>

  <span className="h-7 w-7 rounded-full bg-yellow-400 flex items-center justify-center">
    <ArrowRight className="h-4 w-4 text-black" />
  </span>
</Button>

            </form>

            {/* BACK TO HOME */}
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 text-lg text-white hover:underline"
              >
                <ArrowLeft className="h-4 w-4 text-yellow-400" />
                Back to Home
              </button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
