import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import SecurityShield from "./utils/securityShield";
import TelemetryDiagnosticService from "./services/telemetryDiagnosticService";
import ProductionHardeningService from "./services/productionHardeningService";
import MasterCleanSlateService from "./services/masterCleanSlateService";

// Initialize Security Guard, Telemetry Diagnostics, Production Hardening & Virgin Clean Slate Engine
SecurityShield.init();
TelemetryDiagnosticService.init();
ProductionHardeningService.init();
MasterCleanSlateService.autoEnforceVirginStateOnStartup();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);