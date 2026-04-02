import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { GET } from "@/app/api/weekly-report/route";

const run = (command: string, cwd: string) => {
  execSync(command, { cwd, stdio: "ignore" });
};

test("E2E: weekly-report API returns success payload and writes markdown", async () => {
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;

  const originalEnv = {
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    WORK_DIR: process.env.WORK_DIR,
    THOUGHT_PATH: process.env.THOUGHT_PATH,
    SINCE_DAYS: process.env.SINCE_DAYS,
    DEEPSEEK_RETRY_COUNT: process.env.DEEPSEEK_RETRY_COUNT,
    DEEPSEEK_TIMEOUT_MS: process.env.DEEPSEEK_TIMEOUT_MS,
    DEEPSEEK_BACKOFF_MS: process.env.DEEPSEEK_BACKOFF_MS,
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL,
  };

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-report-api-e2e-"));
  const repoDir = path.join(tempRoot, "repo-a");
  const notesPath = path.join(tempRoot, "notes.md");

  try {
    fs.mkdirSync(repoDir, { recursive: true });
    run("git init", repoDir);
    run("git config user.email \"api-e2e@example.com\"", repoDir);
    run("git config user.name \"API E2E User\"", repoDir);

    fs.writeFileSync(path.join(repoDir, "README.md"), "# api fixture\n", "utf-8");
    run("git add README.md", repoDir);
    run("git commit -m \"feat: api fixture commit\"", repoDir);

    fs.writeFileSync(notesPath, "API 测试笔记", "utf-8");

    process.chdir(tempRoot);
    process.env.DEEPSEEK_API_KEY = "dummy-key";
    process.env.WORK_DIR = tempRoot;
    process.env.THOUGHT_PATH = notesPath;
    process.env.SINCE_DAYS = "7";
    process.env.DEEPSEEK_RETRY_COUNT = "0";
    process.env.DEEPSEEK_TIMEOUT_MS = "5000";
    process.env.DEEPSEEK_BACKOFF_MS = "50";
    process.env.DEEPSEEK_MODEL = "deepseek-chat";

    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  weekSummary: "API 完成周报生成",
                  businessProgress: ["API 返回标准成功结构"],
                  technicalImplementation: ["Route Handler 复用同一编排器"],
                  risksAndBlockers: ["暂无"],
                  nextWeekPlan: ["增加更完整的 HTTP 级集成测试"],
                }),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }) as typeof fetch;

    const response = await GET();
    assert.equal(response.status, 200);

    const payload = (await response.json()) as {
      ok: true;
      data: {
        outputPath?: string;
        reportFileName: string;
        stats: {
          repoCount: number;
          commitCount: number;
          thoughtLength: number;
        };
      };
    };

    assert.equal(payload.ok, true);
    assert.equal(payload.data.stats.repoCount, 1);
    assert.ok(payload.data.stats.commitCount >= 1);
    assert.ok(payload.data.outputPath);
    assert.ok(fs.existsSync(payload.data.outputPath!));

    const markdown = fs.readFileSync(payload.data.outputPath!, "utf-8");
    assert.ok(markdown.includes("# 本周工作总结"));
    assert.ok(markdown.includes("API 完成周报生成"));
    assert.ok(markdown.includes("## 技术实现"));
  } finally {
    process.chdir(originalCwd);
    globalThis.fetch = originalFetch;

    process.env.DEEPSEEK_API_KEY = originalEnv.DEEPSEEK_API_KEY;
    process.env.WORK_DIR = originalEnv.WORK_DIR;
    process.env.THOUGHT_PATH = originalEnv.THOUGHT_PATH;
    process.env.SINCE_DAYS = originalEnv.SINCE_DAYS;
    process.env.DEEPSEEK_RETRY_COUNT = originalEnv.DEEPSEEK_RETRY_COUNT;
    process.env.DEEPSEEK_TIMEOUT_MS = originalEnv.DEEPSEEK_TIMEOUT_MS;
    process.env.DEEPSEEK_BACKOFF_MS = originalEnv.DEEPSEEK_BACKOFF_MS;
    process.env.DEEPSEEK_MODEL = originalEnv.DEEPSEEK_MODEL;

    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
