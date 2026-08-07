 import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex", background: "var(--icj-bg, #F5F7FA)", minHeight: "100vh", color: "var(--icj-text-primary, #212529)" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar />

        <Toolbar />

        <Box
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            textAlign: "center",
            py: 2,
            px: 3,
            bgcolor: "var(--icj-surface, #ffffff)",
            borderTop: "1px solid var(--icj-border, #e5e7eb)",
            color: "var(--icj-text-secondary, #6c757d)",
          }}
        >
          <Typography variant="body2">
            © 2026 International Consortium of Jurists | e-Governance & Enterprise Platform
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
        
