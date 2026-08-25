import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import SecurityShield from "./utils/securityShield";
import TelemetryDiagnosticService from "./services/telemetryDiagnosticService";
import ProductionHardeningService from "./services/productionHardeningService";
import AppBootSanitizer from "./services/appBootSanitizer";

// Initialize Security Guard, Telemetry Diagnostics & Production Hardening Engine V50
SecurityShield.init();
TelemetryDiagnosticService.init();
ProductionHardeningService.init();
AppBootSanitizer.run();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);