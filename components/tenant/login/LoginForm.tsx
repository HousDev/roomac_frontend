"use client";

import { FormEvent } from "react";
import { AppRouterInstance } from "@/src/compat/next-navigation";
import { Mail, Lock, Home, ArrowRight, ChevronDown, User, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface LoginFormProps {
  credentials: { email: string; password: string };
  otpData: { email: string; otp: string };
  otpSent: boolean;
  generatedOtp: string;
  loading: boolean;
  rememberMe: boolean;
  exitAnimation: boolean;
  onCredentialsChange: any;
  onOtpChange: any;
  onRememberMeChange: (checked: boolean) => void;
  onPasswordLogin: (e: FormEvent) => Promise<void>;
  onSendOTP: (e: FormEvent) => Promise<void>;
  onVerifyOTP: (e: FormEvent) => Promise<void>;
  onShowAccounts: () => void;
  router: AppRouterInstance;
}

export default function LoginForm({
  credentials,
  otpData,
  otpSent,
  generatedOtp,
  loading,
  rememberMe,
  exitAnimation,
  onCredentialsChange,
  onOtpChange,
  onRememberMeChange,
  onPasswordLogin,
  onSendOTP,
  onVerifyOTP,
  onShowAccounts,
  router
}: LoginFormProps) {
  return (
    <div className={`relative bg-white
      rounded-[30px] rounded-tr-[100px] rounded-bl-[100px]
      p-7 border border-gray-200
      shadow-[0_30px_60px_rgba(0,0,0,0.20)]
      hover:shadow-[0_45px_90px_rgba(0,0,0,0.25)]
      transition-all duration-300
      overflow-hidden ${exitAnimation ? "animate-out fade-out-50 slide-out-to-bottom" : ""}`}
    >
      {/* inner depth */}
      <div className="absolute inset-0 rounded-[30px] pointer-events-none
        shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]" />

      <form onSubmit={onPasswordLogin} className="space-y-4 relative z-10">
        {/* Email */}
        <div>
          <Label className="text-sm font-semibold text-black">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) => onCredentialsChange("email", e.target.value)}
              className="h-11 rounded-full text-sm
                bg-blue-50 border border-gray-300
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                pl-10 pr-4 transition"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <Label className="text-sm font-semibold text-black">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-800" />
            <Input
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => onCredentialsChange("password", e.target.value)}
              className="h-11 rounded-full text-sm
                bg-blue-50 border border-gray-300
                focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                pl-10 pr-4 transition"
              required
            />
          </div>
        </div>

        {/* Remember + Forgot */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(c) => onRememberMeChange(c as boolean)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-gray-600">Remember me</span>
          </div>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => toast.info("Password reset coming soon")}
          >
            Forgot Password?
          </button>
        </div>

        {/* Premium Login Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full
            bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600
            hover:from-blue-700 hover:to-blue-700
            text-white font-bold tracking-wide
            active:scale-[0.97]
            transition-all relative overflow-hidden group"
        >
          {/* Shine effect on button */}
          <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
          {loading ? "Logging in..." : "LOGIN"}
        </Button>
      </form>

      {/* OTP Section */}
      <div className="mt-5 relative z-10">
        {!otpSent ? (
          <form onSubmit={onSendOTP}>
            <Button
              type="submit"
              variant="outline"
              className="w-full h-11 rounded-full
                border-purple-300 text-purple-700
                hover:bg-blue-600 hover:text-white
                shadow-sm hover:shadow-md transition"
            >
              <Mail className="w-4 h-4 mr-2" />
              Login with OTP
            </Button>
          </form>
        ) : (
          <form
            onSubmit={onVerifyOTP}
            className="mt-3 p-4 rounded-2xl
              border border-purple-200 bg-purple-50 space-y-2"
          >
            <Input
              placeholder="Enter 6-digit OTP"
              value={otpData.otp}
              onChange={(e) => onOtpChange("otp", e.target.value)}
              className="h-9 rounded-full text-xs
                focus:ring-4 focus:ring-purple-200"
              maxLength={6}
              required
            />
            <p className="text-[10px] text-purple-600">
              Test OTP: {generatedOtp}
            </p>
            <Button
              type="submit"
              className="w-full h-9 rounded-full
                bg-purple-600 hover:bg-purple-700 text-white"
            >
              Verify OTP
            </Button>
          </form>
        )}
      </div>

      {/* Divider */}
      <div className="my-5 relative z-10">
        <div className="border-t border-gray-200" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 text-[10px] text-gray-500">
          OR
        </span>
      </div>

      {/* Google Sign In */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-11 rounded-full
          border-gray-300 bg-white
          flex items-center justify-center gap-3
          hover:bg-blue-100 hover:text-black
          shadow-sm hover:shadow-md transition-all"
        onClick={() => toast.info("Google sign-in coming soon")}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google
      </Button>

      {/* Footer */}
      <div className="text-center mt-4 text-xs">
        <p className="text-gray-600">
          New tenant?{" "}
          <span 
            className="text-blue-600 font-semibold cursor-pointer"
            onClick={() => toast.info("Account creation coming soon")}
          >
            Create Account
          </span>
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}