/**
 * ICJ Enterprise Platform
 * Protected Route Component
 * Version : 1.0.0
 */

import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2, background: "linear-gradient(135deg, #0B5ED7 0%, #084298 100%)", color: "#fff" }}>
        <CircularProgress size={48} sx={{ color: "#fff" }} />
        <Typography variant="h6">Authenticating...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

