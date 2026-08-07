 import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex", background: "#F5F7FA", minHeight: "100vh" }}>
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
            p: { xs: 2, md: 4 },
          }}
        >
          {children}
        </Box>

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
        