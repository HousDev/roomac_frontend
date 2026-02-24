import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/authContext";

// export default function ProtectedRoute() {
//     const { isAuthenticated } = useAuth();

//     if (!isAuthenticated) {
//         return <Navigate to={"/login"} replace />;
//     }

//     return <Outlet />;
// }

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}