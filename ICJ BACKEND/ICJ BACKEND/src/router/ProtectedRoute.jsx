import AuthService from "../services/authService";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";
import useAuth from "../hooks/useAuth";

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "member").toLowerCase();
  
  // ─── GUEST ADMIN SESSION TIME-LIMIT SECURITY CHECK ───
  if (user?.expiryTime && Date.now() > Number(user.expiryTime)) {
    console.warn("Guest Admin session has expired!");
    // Auto logout
    AuthService.logout && AuthService.logout();
    alert("आपका गेस्ट एडमिन सत्र (Session) समाप्त हो चुका है।");
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles.map((r) => String(r).toLowerCase());
  
  // Helper to identify custom dynamic admin roles (Trustee, Volunteer, Employee, etc.)
  const isCustomAdmin = (r) => {
    if (["admin", "super_admin"].includes(r)) return true;
    if (["member", "client"].includes(r)) return false;
    return true; // trustee, volunteer, employee, branch_admin are dynamic admin roles
  };

  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(userRole) || 
                      (allowedRoles.includes("admin") && isCustomAdmin(userRole));
    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
