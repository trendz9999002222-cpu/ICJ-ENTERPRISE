type LogLevel = "info" | "warn" | "error";

const log = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = { level, message, ...meta, timestamp: new Date().toISOString() };
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log("error", message, meta),
};
