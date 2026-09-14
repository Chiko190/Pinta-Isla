import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const home = { customer: "/customer/dashboard", artist: "/artist/dashboard", admin: "/admin/dashboard" }[
      user.role
    ];
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
