import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouter from "./router";
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import AuditLogService from "./services/auditLogService";

AuditLogService.initializeRuntime({
  version: import.meta.env.VITE_APP_VERSION || import.meta.env.PACKAGE_VERSION || "0.0.0",
  source: "web",
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);

