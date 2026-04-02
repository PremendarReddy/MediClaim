import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../ui/Loading";

export default function ProtectedRoute({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loading />;
    }

    // If not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in but role doesn't match the allowed roles for this route
    if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
        // Redirect to their respective dashboard instead of letting them see unauthorized pages
        const role = user.role.toLowerCase();
        if (role === "hospital") {
            return <Navigate to="/hospital/dashboard" replace />;
        } else if (role === "patient") {
            return <Navigate to="/patient/dashboard" replace />;
        } else if (role === "insurance") {
            return <Navigate to="/insurance/dashboard" replace />;
        } else {
            return <Navigate to="/" replace />;
        }
    }

    // User is logged in and has the correct role
    return <Outlet />;
}
