"use client";

import { CheckCircle, Sparkles } from "lucide-react";

export default function LoginConfirmation() {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-500 to-blue-500 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Confirmation Content */}
      <div className="relative z-10 text-center text-white space-y-8 max-w-2xl px-6 animate-in zoom-in duration-700">
        {/* Animated Checkmark with Sparkles */}
        <div className="relative mx-auto w-40 h-40">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-ping-slow"></div>
          <div className="relative">
            <CheckCircle className="w-full h-full animate-in zoom-in duration-1000" strokeWidth={1} />
            <Sparkles className="absolute -top-2 -right-2 w-10 h-10 text-yellow-300 animate-spin-slow" />
            <Sparkles className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-300 animate-spin-slow delay-300" />
          </div>
        </div>
        
        {/* Success Message */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight animate-in slide-in-from-bottom duration-700 delay-300">
            Login Successful! 🎉
          </h1>
          <div className="h-1 w-32 bg-white/50 rounded-full mx-auto animate-in slide-in-from-bottom duration-700 delay-500"></div>
          <p className="text-xl md:text-2xl text-white/90 animate-in slide-in-from-bottom duration-700 delay-700">
            Welcome back to Roomac Portal
          </p>
          <p className="text-lg text-white/80 animate-in slide-in-from-bottom duration-700 delay-900">
            Redirecting to your dashboard...
          </p>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="pt-8 animate-in fade-in duration-1000 delay-1100">
          <div className="w-64 md:w-80 h-3 bg-white/30 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-gradient-to-r from-white to-yellow-200 rounded-full animate-progress"
              style={{ animationDuration: '1s' }}
            ></div>
          </div>
          <div className="flex justify-between text-sm mt-2 text-white/70">
            <span>Redirecting in</span>
            <span className="font-bold">1 seconds</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center gap-4 pt-6">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
        </div>
      </div>

      {/* Bottom Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#ffffff" fillOpacity="0.1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
}