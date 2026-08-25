import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import SecurityShield from "./utils/securityShield";
import TelemetryDiagnosticService from "./services/telemetryDiagnosticService";
import ProductionHardeningService from "./services/productionHardeningService";
import AppBootSanitizer from "./services/appBootSanitizer";

import WebVitalsTelemetry from "./services/webVitalsTelemetry";

// Initialize Security Guard, Telemetry Diagnostics & Production Hardening Engine V50
SecurityShield.init();
TelemetryDiagnosticService.init();
ProductionHardeningService.init();
AppBootSanitizer.run();
WebVitalsTelemetry.init();

// Register PWA Service Worker for Google-Grade instant caching & offline access
if (typeof window !== "undefined" && "serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("🟢 [ICJ PWA Service Worker] Registered:", reg.scope))
      .catch((err) => console.warn("⚠️ [ICJ Service Worker Notice]:", err.message));
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);