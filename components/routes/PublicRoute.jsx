import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/authContext";

export default function PublicRoute({ redirectTo }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
