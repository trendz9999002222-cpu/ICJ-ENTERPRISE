type LogLevel = "info" | "warn" | "error";

const truncateMeta = (meta: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}… [truncated, ${value.length} chars]`;
    } else {
      out[key] = value;
    }
  }
  return out;
};

const log = (
  level: LogLevel,
  message: string,
  meta?: Record<string, unknown>,
) => {
  const payload = {
    level,
    message,
    meta: truncateMeta(meta ?? {}),
    timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(message, payload.meta);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.info(payload);
  }
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) =>
    log("info", message, meta),

  warn: (message: string, meta?: Record<string, unknown>) =>
    log("warn", message, meta),

  error: (message: string, meta?: Record<string, unknown>) =>
    log("error", message, meta),
};