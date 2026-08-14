import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileBottomNav from "../components/MobileBottomNav";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";
import FloatingInAppBackButton from "../components/common/FloatingInAppBackButton";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex", background: "#F5F7FA", minHeight: "100vh", width: "100%", overflowX: "hidden" }} className="mobile-app-container">
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
          pb: { xs: 8, md: 2 },
        }}
      >
        <Topbar />

        <Box
          sx={{
            flex: 1,
            p: { xs: 0.8, sm: 1, md: 1.2 },
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <GlobalErrorBoundary componentName="MainLayoutPage">
            {children}
          </GlobalErrorBoundary>
        </Box>
        <MobileBottomNav />

        {/* UNIVERSAL FLOATING IN-APP BACK NAVIGATION BUTTON — FLOATING ON ALL 52 PAGES */}
        <FloatingInAppBackButton />

        <Box
          component="footer"
          sx={{
            textAlign: "center",
            py: 2,
            bgcolor: "#ffffff",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Typography variant="body2">
            © 2026 International Consortium of Jurists
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
        