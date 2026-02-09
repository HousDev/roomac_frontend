"use client";

import { useState, useCallback } from "react";
import { useRouter } from "@/src/compat/next-navigation";
import { toast } from "sonner";
import LoginConfirmation from "./LoginConfirmation";
import ImageGallery from "./ImageGallery";
import LoginForm from "./LoginForm";
import QuickLoginAccounts from "./QuickLoginAccounts";
import { loginTenant, sendTenantOTP, verifyTenantOTP } from "@/lib/tenantAuthApi";

interface LoginClientProps {
  initialPropertyImages: string[];
}

export default function LoginClient({ initialPropertyImages }: LoginClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [propertyImages] = useState<string[]>(initialPropertyImages);
  const [exitAnimation, setExitAnimation] = useState(false);
  const [slideDirection, setSlideDirection] = useState("");

  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const [otpData, setOtpData] = useState({
    email: "",
    otp: ""
  });

  const handleSuccessfulLogin = useCallback(() => {
    setSlideDirection("slide-out-right-bottom");
    setExitAnimation(true);
    
    setTimeout(() => {
      setShowConfirmation(true);
    }, 300);
    
    setTimeout(() => {
      router.push("/tenant/portal");
    }, 2500);
  }, [router]);

  const handlePasswordLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginTenant(credentials.email, credentials.password);

      if (result.success && result.token) {
        if (rememberMe) {
          localStorage.setItem("tenant_token", result.token);
          if (result.tenant_id != null) localStorage.setItem("tenant_id", String(result.tenant_id));
          else localStorage.setItem("tenant_id", "me");
          localStorage.setItem("tenant_email", credentials.email);
        } else {
          sessionStorage.setItem("tenant_token", result.token);
          if (result.tenant_id != null) sessionStorage.setItem("tenant_id", String(result.tenant_id));
          else sessionStorage.setItem("tenant_id", "me");
          sessionStorage.setItem("tenant_email", credentials.email);
        }

        handleSuccessfulLogin();
      } else {
        toast.error(result.error || result.message || "Invalid credentials");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [credentials, rememberMe, handleSuccessfulLogin]);

  const handleSendOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const result = await sendTenantOTP(otpData.email);

      if (result.success) {
        setOtpSent(true);
        setGeneratedOtp(result.otp || "123456");
        toast.success(`OTP sent! For testing: ${result.otp}`);
      } else {
        toast.error(result.error || result.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }, [otpData.email]);

  const handleVerifyOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifyTenantOTP(otpData.email, otpData.otp);

      if (result.success && result.token) {
        if (rememberMe) {
          localStorage.setItem("tenant_token", result.token);
          if (result.tenant_id != null) localStorage.setItem("tenant_id", String(result.tenant_id));
          else localStorage.setItem("tenant_id", "me");
          localStorage.setItem("tenant_email", otpData.email);
        } else {
          sessionStorage.setItem("tenant_token", result.token);
          if (result.tenant_id != null) sessionStorage.setItem("tenant_id", String(result.tenant_id));
          else sessionStorage.setItem("tenant_id", "me");
          sessionStorage.setItem("tenant_email", otpData.email);
        }

        handleSuccessfulLogin();
      } else {
        toast.error(result.error || result.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }, [otpData, rememberMe, handleSuccessfulLogin]);

  const handleQuickLogin = useCallback((email: string, password: string) => {
    setCredentials({ email, password });
    setShowAccounts(false);
    toast.success("Credentials loaded! Now click Login button");
  }, []);

  const handleInputChange = useCallback((field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleOtpChange = useCallback((field: keyof typeof otpData, value: string) => {
    setOtpData(prev => ({ ...prev, [field]: value }));
  }, []);

  if (showConfirmation) {
    return <LoginConfirmation />;
  }

  return (
    <div className={`h-screen flex overflow-hidden bg-white relative ${exitAnimation ? "overflow-hidden" : ""}`}>
      <ImageGallery 
        images={propertyImages}
        exitAnimation={exitAnimation}
        slideDirection={slideDirection}
      />

      <div className={`flex-1 flex items-center justify-center p-6 bg-white relative transition-all duration-500 ${
        exitAnimation ? 
          slideDirection === "slide-out-right-bottom" ? 
            "translate-x-[100%] -translate-y-[100%] rotate-[45deg] opacity-0 scale-50" 
            : "" 
          : ""
      }`}>
        <div className="w-full max-w-md flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="relative text-4xl md:text-5xl font-serif font-extrabold tracking-wide text-blue-900 text-center">
              Tenant Login
              <span className="absolute -bottom-2 left-0 w-20 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="absolute -bottom-2 right-0 w-20 h-1 bg-yellow-400 rounded-full animate-pulse"></span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Access your personalized portal
            </p>
          </div>

          <LoginForm
            credentials={credentials}
            otpData={otpData}
            otpSent={otpSent}
            generatedOtp={generatedOtp}
            loading={loading}
            rememberMe={rememberMe}
            exitAnimation={exitAnimation}
            onCredentialsChange={handleInputChange}
            onOtpChange={handleOtpChange}
            onRememberMeChange={setRememberMe}
            onPasswordLogin={handlePasswordLogin}
            onSendOTP={handleSendOTP}
            onVerifyOTP={handleVerifyOTP}
            onShowAccounts={() => setShowAccounts(true)}
            router={router}
          />
        </div>
      </div>

      {showAccounts && (
        <QuickLoginAccounts
          accounts={testAccounts}
          onSelect={handleQuickLogin}
          onClose={() => setShowAccounts(false)}
        />
      )}

      {exitAnimation && <ExitAnimationOverlay />}
    </div>
  );
}

const testAccounts = [
  { 
    name: "Amit Sharma", 
    email: "amit.sharma@example.com", 
    password: "password123",
    avatar: "AS",
    color: "from-blue-500 to-blue-600"
  },
  { 
    name: "Priya Singh", 
    email: "priya.singh@example.com", 
    password: "password123",
    avatar: "PS",
    color: "from-pink-500 to-pink-600"
  },
  { 
    name: "Rahul Verma", 
    email: "rahul.verma@example.com", 
    password: "password123",
    avatar: "RV",
    color: "from-purple-500 to-purple-600"
  }
];

function ExitAnimationOverlay() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 animate-pulse"
          style={{
            transform: 'rotate(-45deg)',
            top: '50%',
            left: '-50%',
            animationDuration: '1s',
          }}
        />
      </div>
    </>
  );
}