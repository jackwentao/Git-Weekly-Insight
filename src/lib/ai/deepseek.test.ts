import assert from "node:assert/strict";
import test from "node:test";

import { generateWithDeepSeek } from "@/lib/ai/deepseek";

test("generateWithDeepSeek retries once and then succeeds", async () => {
  const originalFetch = globalThis.fetch;
  let callCount = 0;

  try {
    globalThis.fetch = (async () => {
      callCount += 1;

      if (callCount === 1) {
        return new Response("temporary error", { status: 500 });
      }

      return new Response(
        JSON.stringify({
          choices: [{ message: { content: "{\"weekSummary\":\"ok\"}" } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch;

    const result = await generateWithDeepSeek("dummy", "prompt", {
      retryCount: 1,
      timeoutMs: 2000,
      backoffMs: 1,
    });

    assert.equal(result, "{\"weekSummary\":\"ok\"}");
    assert.equal(callCount, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
