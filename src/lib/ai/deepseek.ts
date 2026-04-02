import { logWarn } from "@/lib/utils/logger";

interface DeepSeekOptions {
  model?: string;
  retryCount?: number;
  timeoutMs?: number;
  backoffMs?: number;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableStatus = (status: number): boolean => status === 408 || status === 429 || status >= 500;

export const generateWithDeepSeek = async (
  apiKey: string,
  prompt: string,
  options: DeepSeekOptions = {},
): Promise<string> => {
  const model = options.model ?? "deepseek-chat";
  const retryCount = Math.max(0, options.retryCount ?? 2);
  const timeoutMs = Math.max(1000, options.timeoutMs ?? 15000);
  const backoffMs = Math.max(100, options.backoffMs ?? 500);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          stream: false,
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text();
        const message = `DeepSeek API request failed: ${response.status} ${detail}`;
        if (attempt < retryCount && isRetryableStatus(response.status)) {
          const waitMs = backoffMs * 2 ** attempt;
          logWarn("Retrying DeepSeek request after retryable status.", {
            attempt: attempt + 1,
            retryCount,
            status: response.status,
            waitMs,
          });
          await sleep(waitMs);
          continue;
        }

        throw new Error(message);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      return data.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown DeepSeek error");
      lastError = err;

      const isAbort = err.name === "AbortError";
      if (attempt < retryCount) {
        const waitMs = backoffMs * 2 ** attempt;
        logWarn("Retrying DeepSeek request after error.", {
          attempt: attempt + 1,
          retryCount,
          reason: isAbort ? "timeout" : err.message,
          waitMs,
        });
        await sleep(waitMs);
        continue;
      }

      if (isAbort) {
        throw new Error(`DeepSeek request timed out after ${timeoutMs}ms`);
      }

      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError ?? new Error("DeepSeek request failed unexpectedly.");
};
