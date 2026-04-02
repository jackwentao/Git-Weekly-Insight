const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value) {
    return undefined;
  }

  return value;
};

export interface AppEnv {
  deepseekApiKey?: string;
  deepseekModel: string;
  deepseekRetryCount: number;
  deepseekTimeoutMs: number;
  deepseekBackoffMs: number;
  workDir: string;
  thoughtPath?: string;
  sinceDays: number;
}

interface LoadEnvOptions {
  requireApiKey?: boolean;
  requireWorkDir?: boolean;
}

export const loadEnv = (options: LoadEnvOptions = {}): AppEnv => {
  const { requireApiKey = true, requireWorkDir = true } = options;
  const sinceDays = Number(process.env.SINCE_DAYS ?? "7");
  const deepseekRetryCount = Number(process.env.DEEPSEEK_RETRY_COUNT ?? "2");
  const deepseekTimeoutMs = Number(process.env.DEEPSEEK_TIMEOUT_MS ?? "15000");
  const deepseekBackoffMs = Number(process.env.DEEPSEEK_BACKOFF_MS ?? "500");

  return {
    deepseekApiKey: requireApiKey
      ? getRequiredEnv("DEEPSEEK_API_KEY")
      : getOptionalEnv("DEEPSEEK_API_KEY"),
    deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    deepseekRetryCount: Number.isNaN(deepseekRetryCount) ? 2 : deepseekRetryCount,
    deepseekTimeoutMs: Number.isNaN(deepseekTimeoutMs) ? 15000 : deepseekTimeoutMs,
    deepseekBackoffMs: Number.isNaN(deepseekBackoffMs) ? 500 : deepseekBackoffMs,
    workDir: requireWorkDir ? getRequiredEnv("WORK_DIR") : getOptionalEnv("WORK_DIR") ?? "",
    thoughtPath: getOptionalEnv("THOUGHT_PATH"),
    sinceDays: Number.isNaN(sinceDays) ? 7 : sinceDays,
  };
};
