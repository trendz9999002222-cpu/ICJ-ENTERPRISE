/**
 * ==========================================================
 * Enterprise Platform Engine (EPE)
 * Global Application Configuration
 * Version : 1.0.0
 * ==========================================================
 */

const AppConfig = {
  app: {
    name: "International Consortium of Jurists",
    shortName: "ICJ",
    platform: "ICJ AI Platform",
    version: "1.0.0",
    environment: "development",
  },

  company: {
    organization: "International Consortium of Jurists",
    country: "India",
    website: "",
    email: "",
    phone: "",
  },

  branding: {
    logo: "",
    favicon: "",
    primaryColor: "#0B5ED7",
    secondaryColor: "#198754",
    theme: "light",
  },

  security: {
    authentication: true,
    registration: true,
    auditLogs: true,
    twoFactor: false,
  },

  modules: {
    dashboard: true,
    membership: true,
    legal: true,
    research: true,
    finance: true,
    marketplace: false,
    media: false,
    training: false,
    documentVault: true,
    aiAssistant: true,
  },

  whiteLabel: {
    enabled: true,
    clientName: "",
    clientLogo: "",
    clientTheme: "",
  },

  api: {
    baseUrl: "http://localhost:5000/api",
    timeout: 30000,
  },
};

export default AppConfig;