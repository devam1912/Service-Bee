import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-center mt-20 text-bee-yellow animate-pulse font-bold tracking-tight uppercase text-xs">Syncing with the Hive...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Unauthorized
    }

    return <Outlet />;
}

