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
      toast.success("Login successful 🎉", {
        duration: 3000,
      });
      
      router.push('/admin/dashboard');
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
