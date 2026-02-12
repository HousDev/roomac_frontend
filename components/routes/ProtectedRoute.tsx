import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContext";

type Props = {
    redirectTo: string;
};

export default function ProtectedRoute({ redirectTo }: Props) {
    const { isAuthenticated, loading } = useAuth();

    // jab auth restore ho raha ho (page refresh)
    if (loading) return null; // ya spinner

    if (!isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
}
