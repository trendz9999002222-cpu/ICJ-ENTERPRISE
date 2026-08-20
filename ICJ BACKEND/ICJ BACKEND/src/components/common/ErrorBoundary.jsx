import React from "react";
import { Box, Paper, Typography, Button, Alert, Stack } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RefreshIcon from "@mui/icons-material/Refresh";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("🔒 Component Safeguard Intercepted Localized Error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <Paper
            elevation={4}
            sx={{
              p: 3,
              maxWidth: 550,
              width: "100%",
              borderRadius: 3,
              bgcolor: "#0f172a",
              color: "#fff",
              borderLeft: "6px solid #ef4444",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <WarningAmberIcon sx={{ color: "#ef4444", fontSize: 32 }} />
              <Typography variant="h6" fontWeight="bold" color="#f87171">
                Component Safeguard Active
              </Typography>
            </Stack>

            <Alert severity="warning" sx={{ mb: 2, bgcolor: "rgba(245, 158, 11, 0.15)", color: "#fcd34d", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
              The platform encountered a localized rendering issue. The rest of the application remains fully operational.
            </Alert>

            <Typography variant="caption" color="#94a3b8" display="block" sx={{ fontFamily: "monospace", mb: 2, p: 1, bgcolor: "#020617", borderRadius: 1 }}>
              {this.state.error?.toString() || "Unknown localized error"}
            </Typography>

            <Button
              variant="contained"
              color="error"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={this.handleReload}
              sx={{ fontWeight: "bold" }}
            >
              Recover & Refresh Screen 🚀
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
