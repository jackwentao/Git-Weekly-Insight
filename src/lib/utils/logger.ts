type LogLevel = "info" | "warn" | "error";

const writeLog = (level: LogLevel, message: string, meta?: Record<string, unknown>) => {
  const payload = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
};

export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  writeLog("info", message, meta);
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  writeLog("warn", message, meta);
};

export const logError = (message: string, meta?: Record<string, unknown>) => {
  writeLog("error", message, meta);
};
