 import { Box, Toolbar, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function MainLayout({ children }) {
  return (
    <Box sx={{ display: "flex", background: "#F5F7FA", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          width: "100%",
        }}
      >
        <Topbar />

        <Toolbar />

        <Box
          sx={{
            flex: 1,
            p: { xs: 1.5, sm: 2, md: 2.5 },
            width: "100%",
            boxSizing: "border-box",
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
        