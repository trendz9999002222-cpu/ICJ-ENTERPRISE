import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import SecurityShield from "./utils/securityShield";
import TelemetryDiagnosticService from "./services/telemetryDiagnosticService";

// Initialize Security Guard & Telemetry Diagnostics
SecurityShield.init();
TelemetryDiagnosticService.init();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);