import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import MobileBottomNav from "../components/MobileBottomNav";
import GlobalErrorBoundary from "../components/common/GlobalErrorBoundary";

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
      </Box>
    </Box>
  );
}

export default MainLayout;
        