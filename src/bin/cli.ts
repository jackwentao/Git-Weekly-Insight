#!/usr/bin/env node

import fs from "node:fs";
import { loadEnvConfig } from "@next/env";

import { loadEnv } from "@/lib/config/env";
import { collectWeeklyCommits } from "@/lib/git/scanRepos";
import { readThoughts } from "@/lib/notes/readThoughts";
import { generateWeeklyReport } from "@/lib/report/generateWeeklyReport";
import { buildGenerateErrorOutput, buildGenerateSuccessOutput } from "@/lib/report/publicOutput";

loadEnvConfig(process.cwd());

const printHelp = () => {
  console.log("Git-Weekly-Insight CLI");
  console.log("");
  console.log("Usage:");
  console.log("  npm run report -- generate");
  console.log("  npm run report -- dry-run");
  console.log("  npm run report -- check-config");
};

const runCheckConfig = () => {
  const env = loadEnv({ requireApiKey: false, requireWorkDir: false });
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!env.workDir) {
    errors.push("WORK_DIR is missing.");
  } else if (!fs.existsSync(env.workDir)) {
    errors.push(`WORK_DIR does not exist: ${env.workDir}`);
  }

  if (!env.deepseekApiKey) {
    warnings.push("DEEPSEEK_API_KEY is not set. generate command will fail.");
  }

  if (env.thoughtPath && !fs.existsSync(env.thoughtPath)) {
    warnings.push(`THOUGHT_PATH not found: ${env.thoughtPath}. It will be treated as empty.`);
  }

  console.log(
    JSON.stringify(
      {
        ok: errors.length === 0,
        env: {
          workDir: env.workDir,
          thoughtPath: env.thoughtPath ?? "",
          sinceDays: env.sinceDays,
          hasApiKey: Boolean(env.deepseekApiKey),
        },
        errors,
        warnings,
      },
      null,
      2,
    ),
  );

  if (errors.length > 0) {
    process.exitCode = 1;
  }
};

const runDry = () => {
  const env = loadEnv({ requireApiKey: false });
  const { commits, repoCount, warnings } = collectWeeklyCommits(env.workDir, env.sinceDays);
  const thoughts = readThoughts(env.thoughtPath);

  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        repoCount,
        commitCount: commits.length,
        thoughtLength: thoughts.length,
        warnings,
        preview: commits.slice(0, 10),
      },
      null,
      2,
    ),
  );
};

const runGenerate = async () => {
  const result = await generateWeeklyReport();

  console.log(
    JSON.stringify(buildGenerateSuccessOutput(result), null, 2),
  );
};

const main = async () => {
  const command = process.argv[2] ?? "generate";

  if (command === "help" || command === "-h" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "check-config") {
    runCheckConfig();
    return;
  }

  if (command === "dry-run") {
    runDry();
    return;
  }

  if (command === "generate") {
    await runGenerate();
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (process.argv[2] === "generate") {
    console.error(JSON.stringify(buildGenerateErrorOutput(message), null, 2));
  } else {
    console.error(`[weekly-report] ${message}`);
  }

  process.exitCode = 1;
});
