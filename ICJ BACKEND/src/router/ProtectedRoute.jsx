import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../hooks/useAuth";
import { hasRouteAccess } from "../core/rbac";
import { resolveRoleCode } from "../core/roles";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = resolveRoleCode(profile, user);
  const allowed = hasRouteAccess(role, location.pathname);
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

