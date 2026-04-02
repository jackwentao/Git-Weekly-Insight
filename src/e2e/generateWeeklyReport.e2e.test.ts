import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { generateWeeklyReport } from "@/lib/report/generateWeeklyReport";

const run = (command: string, cwd: string) => {
  execSync(command, { cwd, stdio: "ignore" });
};

test("E2E: generateWeeklyReport creates markdown from git+notes+ai", async () => {
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

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-report-e2e-"));
  const repoDir = path.join(tempRoot, "repo-a");
  const notesPath = path.join(tempRoot, "notes.md");

  try {
    fs.mkdirSync(repoDir, { recursive: true });
    run("git init", repoDir);
    run("git config user.email \"e2e@example.com\"", repoDir);
    run("git config user.name \"E2E User\"", repoDir);

    fs.writeFileSync(path.join(repoDir, "README.md"), "# fixture\n", "utf-8");
    run("git add README.md", repoDir);
    run("git commit -m \"feat: add fixture commit\"", repoDir);

    fs.writeFileSync(notesPath, "本周重点: 完成周报自动化链路", "utf-8");

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
                  weekSummary: "完成周报自动化 MVP",
                  businessProgress: ["支持一键生成周报"],
                  technicalImplementation: ["打通 Git 扫描、AI 汇总、Markdown 落盘"],
                  risksAndBlockers: ["暂无"],
                  nextWeekPlan: ["补充更多测试样例"],
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

    const result = await generateWeeklyReport();

    assert.equal(result.stats.repoCount, 1);
    assert.ok(result.stats.commitCount >= 1);
    assert.ok(result.outputPath);
    assert.ok(fs.existsSync(result.outputPath!));

    const markdown = fs.readFileSync(result.outputPath!, "utf-8");
    assert.ok(markdown.includes("# 本周工作总结"));
    assert.ok(markdown.includes("## 业务进展"));
    assert.ok(markdown.includes("支持一键生成周报"));
    assert.ok(markdown.includes("## 下周计划"));
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
