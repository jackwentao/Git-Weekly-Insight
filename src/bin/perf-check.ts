#!/usr/bin/env node

import { loadEnvConfig } from "@next/env";

import { loadEnv } from "@/lib/config/env";
import { collectWeeklyCommits } from "@/lib/git/scanRepos";
import { readThoughts } from "@/lib/notes/readThoughts";
import { buildWeeklyPrompt } from "@/lib/prompt/buildPrompt";

loadEnvConfig(process.cwd());

const TARGET_MS = 10000;

const runPerfCheck = () => {
  const startedAt = Date.now();
  const env = loadEnv({ requireApiKey: false });

  const collectStart = Date.now();
  const { commits, repoCount, warnings } = collectWeeklyCommits(env.workDir, env.sinceDays);
  const collectMs = Date.now() - collectStart;

  const thoughtsStart = Date.now();
  const thoughts = readThoughts(env.thoughtPath);
  const thoughtsMs = Date.now() - thoughtsStart;

  const promptStart = Date.now();
  const prompt = buildWeeklyPrompt({ commits, thoughts, sinceDays: env.sinceDays });
  const promptMs = Date.now() - promptStart;

  const totalMs = Date.now() - startedAt;
  const withinTarget = totalMs < TARGET_MS;

  console.log(
    JSON.stringify(
      {
        ok: withinTarget,
        targetMs: TARGET_MS,
        totalMs,
        stages: {
          collectMs,
          thoughtsMs,
          promptMs,
        },
        repoCount,
        commitCount: commits.length,
        thoughtLength: thoughts.length,
        promptLength: prompt.length,
        warningCount: warnings.length,
      },
      null,
      2,
    ),
  );

  if (!withinTarget) {
    process.exitCode = 1;
  }
};

runPerfCheck();
