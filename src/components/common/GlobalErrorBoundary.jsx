import { Component } from "react";
import { Box, Paper, Typography, Button, Stack, Alert } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import LoggerService from "../../services/loggerService";

/**
 * ICJ ENTERPRISE PLATFORM — GLOBAL REACT ERROR BOUNDARY
 * Catches unhandled rendering errors and displays a professional fallback UI.
 */
export default class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    LoggerService.logError(
      this.props.componentName || "ComponentBoundary",
      error,
      errorInfo
    );
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3, my: 2, display: "flex", justifyContent: "center" }}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: "100%",
              borderRadius: 3,
              textAlign: "center",
              borderTop: "6px solid #d32f2f",
            }}
          >
            <ErrorIcon color="error" sx={{ fontSize: 56, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Component Safeguard Active
            </Typography>
            <Typography color="text.secondary" paragraph>
              The platform encountered a localized rendering issue in{" "}
              <strong>{this.props.componentName || "this module"}</strong>. The rest of the application remains fully operational.
            </Typography>

            <Alert severity="error" sx={{ my: 2, textAlign: "left" }}>
              <Typography variant="caption" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                {this.state.error?.message || "Localized rendering error caught safely."}
              </Typography>
            </Alert>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
              >
                Try Re-rendering
              </Button>
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => (window.location.href = "/")}
              >
                Return to Dashboard
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
