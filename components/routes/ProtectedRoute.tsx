// components/routes/ProtectedRoute.tsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "@/context/authContext";



// export default function ProtectedRoute() {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) return null;

//   return isAuthenticated || localStorage.getItem("auth_token") ? <Outlet /> : <Navigate to="/login" replace />;
// }


// components/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/authContext";
import { savePaymentIntent } from "@/lib/paymentRecordApi";

export default function () {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const isLoggedIn = isAuthenticated || localStorage.getItem("auth_token");
  
  if (!isLoggedIn) {
    const searchParams = new URLSearchParams(location.search);
    const demandId = searchParams.get("demand_id");
    const action = searchParams.get("action");
    const openPaymentForm = searchParams.get("openPaymentForm");
    const paymentType = searchParams.get("payment_type");
    
    if (demandId && action === "pay") {
      savePaymentIntent({
        type: "demand",
        demandId: parseInt(demandId),
        action: action,
        // ✅ Convert null to undefined
        paymentType: paymentType === null ? undefined : paymentType,
        returnUrl: location.pathname,
      });
    } else if (openPaymentForm === "true") {
      savePaymentIntent({
        type: "open_payment",
        openPaymentForm: true,
        // ✅ Convert null to undefined
        paymentType: paymentType === null ? undefined : paymentType,
        returnUrl: location.pathname,
      });
    }
    
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}