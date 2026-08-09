/**
 * ICJ ENTERPRISE PLATFORM — PHASE 13.0
 * Production Infrastructure Service
 * Manages all external API configurations locally — NO live connections.
 */

// ─── Storage Keys ──────────────────────────────────────────────
const KEYS = {
  PROVIDERS:    "icj_infra_providers",
  ENV_CHECKS:   "icj_infra_env",
  HEALTH_CACHE: "icj_infra_health",
  WIZARD_STATE: "icj_infra_wizard",
};

// ─── Default Provider Catalog ─────────────────────────────────
export const PROVIDER_CATALOG = [
  {
    id: "postgresql",
    name: "PostgreSQL Database",
    category: "Database",
    icon: "Storage",
    description: "Primary relational database",
    envVars: ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "DATABASE_URL"],
    fields: [
      { key: "host",     label: "Host",          type: "text",     placeholder: "localhost", secret: false },
      { key: "port",     label: "Port",          type: "number",   placeholder: "5432",      secret: false },
      { key: "database", label: "Database Name", type: "text",     placeholder: "icj_prod",  secret: false },
      { key: "username", label: "Username",      type: "text",     placeholder: "postgres",  secret: false },
      { key: "password", label: "Password",      type: "password", placeholder: "••••••••",  secret: true  },
      { key: "ssl",      label: "Enable SSL",    type: "boolean",  placeholder: "false",     secret: false },
      { key: "poolMin",  label: "Pool Min",      type: "number",   placeholder: "2",         secret: false },
      { key: "poolMax",  label: "Pool Max",      type: "number",   placeholder: "10",        secret: false },
    ],
    status: "not_configured",
    required: true,
  },
  {
    id: "smtp",
    name: "SMTP Email Gateway",
    category: "Communication",
    icon: "Email",
    description: "Outbound email for notifications and alerts",
    envVars: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM"],
    fields: [
      { key: "host",     label: "SMTP Host",   type: "text",     placeholder: "smtp.gmail.com", secret: false },
      { key: "port",     label: "SMTP Port",   type: "number",   placeholder: "587",            secret: false },
      { key: "username", label: "Username",    type: "text",     placeholder: "admin@icj.gov",  secret: false },
      { key: "password", label: "Password",    type: "password", placeholder: "App password",   secret: true  },
      { key: "from",     label: "From Address",type: "text",     placeholder: "noreply@icj.gov",secret: false },
      { key: "tls",      label: "Enable TLS",  type: "boolean",  placeholder: "true",           secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "sms",
    name: "SMS Gateway",
    category: "Communication",
    icon: "Sms",
    description: "SMS OTP and notification service",
    envVars: ["SMS_PROVIDER", "SMS_API_KEY", "SMS_SENDER_ID"],
    fields: [
      { key: "provider",  label: "Provider",    type: "select",   options: ["Twilio","MSG91","Textlocal","Amazon SNS"], secret: false },
      { key: "apiKey",    label: "API Key",     type: "password", placeholder: "••••••••••••", secret: true  },
      { key: "apiSecret", label: "API Secret",  type: "password", placeholder: "••••••••••••", secret: true  },
      { key: "senderId",  label: "Sender ID",   type: "text",     placeholder: "ICJGOV",        secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    category: "Communication",
    icon: "WhatsApp",
    description: "WhatsApp notifications and alerts",
    envVars: ["WA_PHONE_NUMBER_ID", "WA_ACCESS_TOKEN", "WA_BUSINESS_ID"],
    fields: [
      { key: "phoneNumberId", label: "Phone Number ID", type: "text",     placeholder: "1234567890",    secret: false },
      { key: "accessToken",   label: "Access Token",    type: "password", placeholder: "EAAxx...",       secret: true  },
      { key: "businessId",    label: "Business ID",     type: "text",     placeholder: "9876543210",    secret: false },
      { key: "webhookToken",  label: "Webhook Token",   type: "password", placeholder: "wh_secret...",  secret: true  },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "payment",
    name: "Payment Gateway",
    category: "Finance",
    icon: "Payment",
    description: "Online payment processing",
    envVars: ["PAYMENT_PROVIDER", "PAYMENT_KEY_ID", "PAYMENT_KEY_SECRET"],
    fields: [
      { key: "provider",  label: "Provider",     type: "select",   options: ["Razorpay","PayU","CCAvenue","Stripe","PayPal"], secret: false },
      { key: "keyId",     label: "Key ID",       type: "text",     placeholder: "rzp_live_xxxx",  secret: false },
      { key: "keySecret", label: "Key Secret",   type: "password", placeholder: "••••••••••••",   secret: true  },
      { key: "webhook",   label: "Webhook Secret",type: "password", placeholder: "whsec_...",      secret: true  },
      { key: "mode",      label: "Mode",         type: "select",   options: ["test","live"],       secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "google_maps",
    name: "Google Maps API",
    category: "Location",
    icon: "Map",
    description: "Location and geocoding services",
    envVars: ["GOOGLE_MAPS_API_KEY"],
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "AIzaSy...", secret: true },
      { key: "region", label: "Default Region", type: "text", placeholder: "IN", secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "google_oauth",
    name: "Google OAuth",
    category: "Authentication",
    icon: "Google",
    description: "Google SSO login",
    envVars: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    fields: [
      { key: "clientId",     label: "Client ID",     type: "text",     placeholder: "xxx.apps.googleusercontent.com", secret: false },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "GOCSPX-...", secret: true },
      { key: "redirectUri",  label: "Redirect URI",  type: "text",     placeholder: "https://app.icj.gov/auth/google/callback", secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "cloud_storage",
    name: "Cloud Storage",
    category: "Storage",
    icon: "CloudUpload",
    description: "Document and media file storage",
    envVars: ["STORAGE_PROVIDER", "STORAGE_BUCKET", "STORAGE_ACCESS_KEY", "STORAGE_SECRET_KEY"],
    fields: [
      { key: "provider",   label: "Provider",      type: "select",   options: ["AWS S3","Google Cloud","Azure Blob","MinIO","Cloudinary"], secret: false },
      { key: "bucket",     label: "Bucket / Container", type: "text", placeholder: "icj-documents", secret: false },
      { key: "region",     label: "Region",        type: "text",     placeholder: "ap-south-1", secret: false },
      { key: "accessKey",  label: "Access Key",    type: "password", placeholder: "AKIA...", secret: true  },
      { key: "secretKey",  label: "Secret Key",    type: "password", placeholder: "••••••••", secret: true  },
      { key: "endpoint",   label: "Endpoint (MinIO)", type: "text",  placeholder: "http://localhost:9000", secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "ai_provider",
    name: "AI Provider",
    category: "AI",
    icon: "AutoAwesome",
    description: "AI/LLM service for legal drafting and assistance",
    envVars: ["AI_PROVIDER", "AI_API_KEY", "AI_MODEL"],
    fields: [
      { key: "provider", label: "Provider",    type: "select",   options: ["Google Gemini","OpenAI","Anthropic","Azure OpenAI","Local Ollama"], secret: false },
      { key: "apiKey",   label: "API Key",     type: "password", placeholder: "sk-...", secret: true  },
      { key: "model",    label: "Model",       type: "text",     placeholder: "gemini-pro", secret: false },
      { key: "endpoint", label: "API Endpoint (custom)", type: "text", placeholder: "https://api.openai.com/v1", secret: false },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "backup_storage",
    name: "Backup Storage",
    category: "Storage",
    icon: "Backup",
    description: "Automated database and file backups",
    envVars: ["BACKUP_PROVIDER", "BACKUP_PATH", "BACKUP_SCHEDULE"],
    fields: [
      { key: "provider",  label: "Provider",        type: "select",  options: ["Local Disk","AWS S3","Google Drive","FTP","SFTP"], secret: false },
      { key: "path",      label: "Backup Path",     type: "text",    placeholder: "/var/backups/icj", secret: false },
      { key: "schedule",  label: "Cron Schedule",   type: "text",    placeholder: "0 2 * * *", secret: false },
      { key: "retention", label: "Retention (days)", type: "number", placeholder: "30", secret: false },
      { key: "accessKey", label: "Access Key",       type: "password", placeholder: "••••", secret: true },
    ],
    status: "not_configured",
    required: false,
  },
  {
    id: "domain_ssl",
    name: "Domain & SSL Gateway",
    category: "Infrastructure",
    icon: "Security",
    description: "Domain DNS, SSL certificates, HTTPS enforcement & CORS management",
    envVars: ["DOMAIN_NAME", "SSL_CERT_PATH", "SSL_KEY_PATH", "FORCE_HTTPS"],
    fields: [
      { key: "domain",      label: "Fully Qualified Domain", type: "text",     placeholder: "app.icj.gov", secret: false },
      { key: "forceHttps",  label: "Force HTTPS",            type: "boolean",  placeholder: "true",        secret: false },
      { key: "certPath",    label: "SSL Certificate Path",   type: "text",     placeholder: "/etc/ssl/certs/icj.crt", secret: false },
      { key: "keyPath",     label: "SSL Private Key Path",   type: "password", placeholder: "/etc/ssl/private/icj.key", secret: true },
      { key: "corsOrigins", label: "Allowed CORS Origins",   type: "text",     placeholder: "https://app.icj.gov, https://api.icj.gov", secret: false },
    ],
    status: "not_configured",
    required: true,
  },
];

// ─── Env variable definitions (for validation) ────────────────
export const ENV_VARIABLE_CATALOG = [
  { key: "DATABASE_URL",       category: "Database",        required: true,  description: "Full PostgreSQL connection string" },
  { key: "DB_HOST",            category: "Database",        required: true,  description: "PostgreSQL host" },
  { key: "DB_PORT",            category: "Database",        required: true,  description: "PostgreSQL port (default 5432)" },
  { key: "DB_USER",            category: "Database",        required: true,  description: "PostgreSQL username" },
  { key: "DB_PASSWORD",        category: "Database",        required: true,  description: "PostgreSQL password" },
  { key: "DB_NAME",            category: "Database",        required: true,  description: "PostgreSQL database name" },
  { key: "SMTP_HOST",          category: "Email",           required: false, description: "SMTP server hostname" },
  { key: "SMTP_PORT",          category: "Email",           required: false, description: "SMTP port (587 for TLS)" },
  { key: "SMTP_USER",          category: "Email",           required: false, description: "SMTP authentication username" },
  { key: "SMTP_PASS",          category: "Email",           required: false, description: "SMTP authentication password" },
  { key: "SMTP_FROM",          category: "Email",           required: false, description: "Default sender email address" },
  { key: "SMS_API_KEY",        category: "SMS",             required: false, description: "SMS gateway API key" },
  { key: "SMS_SENDER_ID",      category: "SMS",             required: false, description: "SMS sender identifier" },
  { key: "WA_ACCESS_TOKEN",    category: "WhatsApp",        required: false, description: "WhatsApp Business API access token" },
  { key: "WA_PHONE_NUMBER_ID", category: "WhatsApp",        required: false, description: "WhatsApp phone number ID" },
  { key: "PAYMENT_KEY_ID",     category: "Payment",         required: false, description: "Payment gateway key ID" },
  { key: "PAYMENT_KEY_SECRET", category: "Payment",         required: false, description: "Payment gateway secret key" },
  { key: "GOOGLE_MAPS_API_KEY",category: "Google APIs",     required: false, description: "Google Maps API key" },
  { key: "GOOGLE_CLIENT_ID",   category: "Google APIs",     required: false, description: "Google OAuth client ID" },
  { key: "GOOGLE_CLIENT_SECRET",category:"Google APIs",     required: false, description: "Google OAuth client secret" },
  { key: "STORAGE_BUCKET",     category: "Storage",         required: false, description: "Cloud storage bucket name" },
  { key: "STORAGE_ACCESS_KEY", category: "Storage",         required: false, description: "Cloud storage access key" },
  { key: "STORAGE_SECRET_KEY", category: "Storage",         required: false, description: "Cloud storage secret key" },
  { key: "AI_API_KEY",         category: "AI",              required: false, description: "AI provider API key" },
  { key: "AI_MODEL",           category: "AI",              required: false, description: "AI model identifier" },
  { key: "BACKUP_PATH",        category: "Backup",          required: false, description: "Backup storage path" },
  { key: "JWT_SECRET",         category: "Security",        required: true,  description: "JWT signing secret (min 32 chars)" },
  { key: "VITE_APP_ENV",       category: "Application",     required: false, description: "Environment: development|production" },
  { key: "VITE_APP_URL",       category: "Application",     required: false, description: "Public application URL" },
];

// ─── HELPERS ──────────────────────────────────────────────────
function load(key, def) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def; }
  catch { return def; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function maskSecret(val) {
  if (!val || val.length === 0) return "";
  if (val.length <= 4) return "••••";
  return val.slice(0, 2) + "•".repeat(Math.min(val.length - 4, 10)) + val.slice(-2);
}

// ─── PROVIDER CONFIG SERVICE ──────────────────────────────────
export const InfraService = {

  // Get all providers (with saved config merged in)
  getProviders() {
    const saved = load(KEYS.PROVIDERS, {});
    return PROVIDER_CATALOG.map(p => ({
      ...p,
      config: saved[p.id]?.config || {},
      status: saved[p.id]?.status || "not_configured",
      enabled: saved[p.id]?.enabled !== false,
      testedAt: saved[p.id]?.testedAt || null,
      savedAt:  saved[p.id]?.savedAt  || null,
    }));
  },

  // Save provider config (mask secrets in display, store raw for form)
  saveProvider(providerId, config) {
    const saved = load(KEYS.PROVIDERS, {});
    saved[providerId] = {
      ...saved[providerId],
      config,
      status: this._deriveStatus(providerId, config),
      enabled: saved[providerId]?.enabled !== false,
      savedAt: new Date().toISOString(),
      testedAt: saved[providerId]?.testedAt || null,
    };
    save(KEYS.PROVIDERS, saved);
    return saved[providerId];
  },

  // Toggle provider enable/disable state
  toggleProviderEnabled(providerId) {
    const saved = load(KEYS.PROVIDERS, {});
    if (!saved[providerId]) saved[providerId] = { config: {}, status: "not_configured", enabled: true };
    saved[providerId].enabled = !saved[providerId].enabled;
    save(KEYS.PROVIDERS, saved);
    return saved[providerId].enabled;
  },

  // Simulate connection test (NO real API calls)
  testConnection(providerId) {
    const saved = load(KEYS.PROVIDERS, {});
    const provider = PROVIDER_CATALOG.find(p => p.id === providerId);
    if (!provider) return { status: "error", message: "Unknown provider" };

    const config = saved[providerId]?.config || {};
    const status = this._deriveStatus(providerId, config);

    // Simulate async test result
    const result = {
      status: status === "configured" ? "connected" : "configuration_missing",
      message: status === "configured"
        ? `${provider.name} configuration is valid and ready.`
        : `${provider.name} is missing required configuration fields.`,
      testedAt: new Date().toISOString(),
      note: "Connection simulation only — no live API calls made.",
    };

    // Save test result
    if (!saved[providerId]) saved[providerId] = { config: {}, status: "not_configured" };
    saved[providerId].testedAt = result.testedAt;
    saved[providerId].lastTestResult = result;
    save(KEYS.PROVIDERS, saved);

    return result;
  },

  // Derive status from config completeness
  _deriveStatus(providerId, config) {
    const provider = PROVIDER_CATALOG.find(p => p.id === providerId);
    if (!provider) return "not_configured";
    const requiredFields = provider.fields.filter(f => f.type !== "boolean" && !f.placeholder?.includes("optional"));
    const filled = requiredFields.filter(f => config[f.key] && String(config[f.key]).trim().length > 0);
    if (filled.length === 0) return "not_configured";
    if (filled.length < requiredFields.length) return "partial";
    return "configured";
  },

  // Mask secrets for display
  getMaskedConfig(providerId) {
    const saved = load(KEYS.PROVIDERS, {});
    const config = saved[providerId]?.config || {};
    const provider = PROVIDER_CATALOG.find(p => p.id === providerId);
    if (!provider) return {};
    const masked = {};
    provider.fields.forEach(f => {
      masked[f.key] = f.secret ? maskSecret(config[f.key] || "") : (config[f.key] || "");
    });
    return masked;
  },

  // Get health summary of all providers
  getHealthSummary() {
    const providers = this.getProviders();
    return providers.map(p => ({
      id:       p.id,
      name:     p.name,
      category: p.category,
      status:   p.status,
      required: p.required,
      testedAt: p.testedAt,
    }));
  },

  // Production validation
  validateProductionReadiness() {
    const providers = this.getProviders();
    const warnings = [];
    const errors = [];

    providers.filter(p => p.required).forEach(p => {
      if (p.status === "not_configured") errors.push({ type: "CRITICAL", provider: p.name, msg: `${p.name} is required but not configured.` });
      else if (p.status === "partial")   warnings.push({ type: "WARNING", provider: p.name, msg: `${p.name} has incomplete configuration.` });
    });

    providers.filter(p => !p.required).forEach(p => {
      if (p.status === "not_configured") warnings.push({ type: "INFO", provider: p.name, msg: `${p.name} is optional but not configured. Feature will be disabled.` });
    });

    const score = Math.round(
      (providers.filter(p => p.status === "configured").length / providers.length) * 100
    );

    return { errors, warnings, score, providers: providers.length, configured: providers.filter(p=>p.status==="configured").length };
  },

  // Wizard state
  getWizardState() { return load(KEYS.WIZARD_STATE, { step: 0, completed: [] }); },
  setWizardStep(step) {
    const s = this.getWizardState();
    s.step = step;
    save(KEYS.WIZARD_STATE, s);
  },
  completeWizardStep(step) {
    const s = this.getWizardState();
    if (!s.completed.includes(step)) s.completed.push(step);
    s.step = step + 1;
    save(KEYS.WIZARD_STATE, s);
  },
  resetWizard() { save(KEYS.WIZARD_STATE, { step: 0, completed: [] }); },

  maskSecret,
};

export default InfraService;
