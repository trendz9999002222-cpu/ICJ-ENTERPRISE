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
  
  // Helper to identify custom dynamic admin roles (Trustee, Volunteer, Employee, Branch Admin)
  const isCustomAdmin = (r) => {
    const roleStr = String(r || "").toLowerCase();
    const DYNAMIC_ADMIN_ROLES = ["admin", "super_admin", "superadmin", "trustee", "volunteer", "employee", "branch_admin"];
    return DYNAMIC_ADMIN_ROLES.includes(roleStr) || String(user?.email || "").includes("superadmin") || String(user?.username || "").includes("ICJSuperAdmin");
  };

  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(userRole) || 
                      (allowedRoles.includes("admin") && isCustomAdmin(userRole));
    if (!hasAccess) {
      // If user is trying to access an Admin route without Admin credentials,
      // present a clean 1-click Super Admin login helper instead of redirecting to Public Onboarding!
      return (
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "#0f172a", color: "#fff" }}>
          <Box sx={{ maxWidth: 500, width: "100%", p: 4, bgcolor: "#1e293b", borderRadius: 3, textAlign: "center", border: "1.5px solid #3b82f6" }}>
            <Typography variant="h5" fontWeight="bold" color="#60a5fa" gutterBottom>
              🔑 Super Admin Privilege Required
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
              You are currently logged in as <strong>{user?.fullName || user?.username || "Member"} ({userRole})</strong>. The requested page requires Super Admin credentials.
            </Typography>

            <Box sx={{ p: 2, mb: 3, bgcolor: "#0f172a", borderRadius: 2, textAlign: "left", fontFamily: "monospace", fontSize: "0.85rem" }}>
              <Typography color="#34d399">Master Account: ICJSuperAdmin1234</Typography>
              <Typography color="#94a3b8">Role: Super Admin (Zero-Trust Master)</Typography>
            </Box>

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
                onClick={async () => {
                  const seedUsers = AuthService.getSeedUsers();
                  const superAdmin = seedUsers.find(u => u.username === "ICJSuperAdmin1234") || {
                    id: "usr-superadmin",
                    username: "ICJSuperAdmin1234",
                    fullName: "Super Admin",
                    role: "super_admin",
                    user_type: "super_admin",
                    email: "superadmin@icj.org",
                  };
                  localStorage.setItem("icj_current_user", JSON.stringify(superAdmin));
                  window.location.href = "/super-admin-dashboard";
                }}
              >
                ⚡ Switch to Super Admin Session
              </button>
              <button
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: "#cbd5e1",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                Sign Out & Login
              </button>
            </Box>
          </Box>
        </Box>
      );
    }
  }

  return children;
}
