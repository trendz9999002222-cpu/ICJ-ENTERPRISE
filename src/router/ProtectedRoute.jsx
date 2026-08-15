import { useEffect, useState } from "react";
import AuthService from "../services/authService";
import { Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import useAuth from "../hooks/useAuth";
import MainLayout from "../layouts/MainLayout";

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, loading, user } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);

  // Guest Admin sessions carry an expiry. The check runs in an effect rather
  // than during render, where it used to fire logout() and alert() as render
  // side effects. Polling also ends the session while the page sits idle,
  // instead of only on the next navigation.
  const expiryTime = user?.expiryTime;
  useEffect(() => {
    if (!expiryTime) return undefined;
    const check = () => {
      if (Date.now() > Number(expiryTime)) {
        setSessionExpired(true);
        AuthService.logout();
      }
    };
    check();
    const timer = setInterval(check, 30000);
    return () => clearInterval(timer);
  }, [expiryTime]);

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

  if (sessionExpired) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user?.role || "member").toLowerCase();

  const allowedRoles = roles.map((r) => String(r).toLowerCase());

  // Only genuine administrator roles satisfy an `admin` route. This previously
  // also accepted trustee/volunteer/employee, and granted admin to anyone whose
  // email merely *contained* "superadmin" — which any self-registered user can set.
  const isAdminRole = (r) =>
    ["admin", "super_admin", "superadmin"].includes(String(r || "").toLowerCase());

  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(userRole) ||
                      (allowedRoles.includes("admin") && isAdminRole(userRole));
    if (!hasAccess) {
      // Plain access denial. This screen previously printed the master account
      // name and offered a one-click button that wrote a super_admin session to
      // localStorage — any signed-in member could promote themselves with it.
      return (
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "#0f172a", color: "#fff" }}>
          <Box sx={{ maxWidth: 500, width: "100%", p: 4, bgcolor: "#1e293b", borderRadius: 3, textAlign: "center", border: "1.5px solid #334155" }}>
            <Typography variant="h5" fontWeight="bold" color="#f87171" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
              You are signed in as <strong>{user?.fullName || user?.username || "Member"} ({userRole})</strong>.
              This page requires additional privileges. If you believe you should have
              access, contact your administrator.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                style={{
                  padding: "10px 20px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => { window.location.href = "/"; }}
              >
                Go to My Dashboard
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  background: "#475569",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  await AuthService.logout();
                  window.location.href = "/login";
                }}
              >
                Sign Out
              </button>
            </Box>
          </Box>
        </Box>
      );
    }
  }

  return <MainLayout>{children}</MainLayout>;
}
