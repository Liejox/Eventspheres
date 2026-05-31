import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { Role } from "@/lib/api";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role?: Role | Role[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  const allowed = role ? (Array.isArray(role) ? role : [role]) : null;
  if (allowed && !allowed.includes(user.role)) {
    // Redirect to the right dashboard
    if (user.role === "company") return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
