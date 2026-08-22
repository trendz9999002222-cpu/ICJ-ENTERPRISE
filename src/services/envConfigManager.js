/**
 * ICJ ENTERPRISE PLATFORM — PHASE 13.1
 * Environment Configuration Manager & Production Config Loader
 * Loads configuration from environment variables and local vault overrides — NO hardcoded secrets.
 */

function getEnvVar(key, fallback = "") {
  // Vite env variable support (import.meta.env)
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env[key] !== undefined) return import.meta.env[key];
    if (import.meta.env[`VITE_${key}`] !== undefined) return import.meta.env[`VITE_${key}`];
  }
  // Process env fallback for Node validation scripts
  if (typeof process !== "undefined" && process.env) {
    if (process.env[key] !== undefined) return process.env[key];
    if (process.env[`VITE_${key}`] !== undefined) return process.env[`VITE_${key}`];
  }
  return fallback;
}

export const ENV_SCHEMA = [
  { key: "DATABASE_URL",       category: "Database",        required: true,  secret: true,  description: "PostgreSQL Connection URI" },
  { key: "DB_HOST",            category: "Database",        required: true,  secret: false, description: "Database Server Hostname" },
  { key: "DB_PORT",            category: "Database",        required: true,  secret: false, description: "Database Port (default 5432)" },
  { key: "DB_USER",            category: "Database",        required: true,  secret: false, description: "Database Username" },
  { key: "DB_PASSWORD",        category: "Database",        required: true,  secret: true,  description: "Database Password" },
  { key: "DB_NAME",            category: "Database",        required: true,  secret: false, description: "Database Name" },
  { key: "SMTP_HOST",          category: "Email",           required: false, secret: false, description: "SMTP Server Host" },
  { key: "SMTP_PORT",          category: "Email",           required: false, secret: false, description: "SMTP Server Port" },
  { key: "SMTP_USER",          category: "Email",           required: false, secret: false, description: "SMTP Username" },
  { key: "SMTP_PASS",          category: "Email",           required: false, secret: true,  description: "SMTP Password" },
  { key: "SMS_API_KEY",        category: "SMS",             required: false, secret: true,  description: "SMS Gateway API Key" },
  { key: "WA_ACCESS_TOKEN",    category: "WhatsApp",        required: false, secret: true,  description: "WhatsApp Business API Access Token" },
  { key: "PAYMENT_KEY_ID",     category: "Payment",         required: false, secret: false, description: "Payment Gateway Key ID" },
  { key: "PAYMENT_KEY_SECRET", category: "Payment",         required: false, secret: true,  description: "Payment Gateway Secret" },
  { key: "STORAGE_BUCKET",     category: "Storage",         required: false, secret: false, description: "Cloud Storage Bucket Name" },
  { key: "STORAGE_ACCESS_KEY", category: "Storage",         required: false, secret: true,  description: "Cloud Storage Access Key" },
  { key: "STORAGE_SECRET_KEY", category: "Storage",         required: false, secret: true,  description: "Cloud Storage Secret Key" },
  { key: "DOMAIN_NAME",        category: "Domain & SSL",    required: true,  secret: false, description: "Production Fully Qualified Domain Name" },
  { key: "SSL_CERT_PATH",      category: "Domain & SSL",    required: false, secret: false, description: "SSL Certificate Chain Path" },
  { key: "SSL_KEY_PATH",       category: "Domain & SSL",    required: false, secret: true,  description: "SSL Private Key Path" },
  { key: "JWT_SECRET",         category: "Security",        required: true,  secret: true,  description: "JWT Signing Secret (min 32 chars)" },
];

export const EnvConfigManager = {
  // Read all variables and check their status against .env
  inspectEnvironment() {
    return ENV_SCHEMA.map(item => {
      const value = getEnvVar(item.key);
      const isSet = value && value.trim().length > 0;
      return {
        ...item,
        isSet,
        maskedValue: isSet ? (item.secret ? "••••••••" : value) : "Not Configured",
        status: isSet ? "configured" : (item.required ? "error" : "not_configured"),
      };
    });
  },

  // Compute production readiness score from environment variables
  getEnvReadinessScore() {
    const inspected = this.inspectEnvironment();
    const total = inspected.length;
    const configured = inspected.filter(i => i.isSet).length;
    const requiredTotal = inspected.filter(i => i.required).length;
    const requiredConfigured = inspected.filter(i => i.required && i.isSet).length;

    const overallScore = Math.round((configured / total) * 100);
    const requiredScore = requiredTotal > 0 ? Math.round((requiredConfigured / requiredTotal) * 100) : 100;

    return {
      overallScore,
      requiredScore,
      total,
      configured,
      missingRequired: requiredTotal - requiredConfigured,
    };
  },

  getReadinessAudit() {
    const inspected = this.inspectEnvironment();
    const scores = this.getEnvReadinessScore();
    return {
      score: scores.overallScore,
      readinessScore: scores.overallScore,
      requiredScore: scores.requiredScore,
      totalVars: scores.total,
      totalCount: scores.total,
      configuredVars: scores.configured,
      configuredCount: scores.configured,
      missingRequired: scores.missingRequired,
      details: inspected,
      readyForProduction: scores.missingRequired === 0,
      deploymentReady: scores.missingRequired === 0,
      timestamp: new Date().toISOString(),
    };
  },

  getEnvVar,
};

export default EnvConfigManager;
