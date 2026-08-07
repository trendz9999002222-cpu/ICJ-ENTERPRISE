import { Component } from "react";
import { Box, Alert, Typography, Button } from "@mui/material";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: String(error?.message || "Unexpected application error."),
    };
  }

  componentDidCatch(error) {
    console.error("[ErrorBoundary] Unhandled UI error:", String(error?.message || error));
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3 }}>
          <Alert severity="error" sx={{ maxWidth: 760, width: "100%" }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {this.state.errorMessage}
            </Typography>
            <Button variant="contained" onClick={this.handleReload}>
              Reload Application
            </Button>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}
