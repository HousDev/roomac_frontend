import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/authContext";

export default function ProtectedRoute({ redirectTo }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
