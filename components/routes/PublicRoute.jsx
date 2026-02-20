import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/authContext";

export default function PublicRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user.role === "admin") {
    return <Navigate to={"/admin/dashboard"} replace />;
  } else if (isAuthenticated && user.role === "tenant") {
    return <Navigate to={"/tenant/portal"} replace />;
  }

  return <Outlet />;
}
