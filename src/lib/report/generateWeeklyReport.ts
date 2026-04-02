import { generateWithDeepSeek } from "@/lib/ai/deepseek";
import { loadEnv } from "@/lib/config/env";
import { collectWeeklyCommits } from "@/lib/git/scanRepos";
import { readThoughts } from "@/lib/notes/readThoughts";
import { buildWeeklyPrompt } from "@/lib/prompt/buildPrompt";
import { buildReportResult, renderReportMarkdown } from "@/lib/report/markdown";
import { parseAiReportJson } from "@/lib/report/parseAiReport";
import { writeReportToFile } from "@/lib/report/writeReport";
import { logInfo } from "@/lib/utils/logger";

export const generateWeeklyReport = async () => {
  const start = Date.now();
  const env = loadEnv();
  if (!env.deepseekApiKey) {
    throw new Error("Missing required environment variable: DEEPSEEK_API_KEY");
  }

  const { commits, repoCount, warnings } = collectWeeklyCommits(env.workDir, env.sinceDays);
  const thoughts = readThoughts(env.thoughtPath);
  const prompt = buildWeeklyPrompt({ commits, thoughts, sinceDays: env.sinceDays });
  logInfo("Weekly report generation started.", {
    repoCount,
    commitCount: commits.length,
    thoughtLength: thoughts.length,
  });

  const rawAiResponse = await generateWithDeepSeek(env.deepseekApiKey, prompt, {
    model: env.deepseekModel,
    retryCount: env.deepseekRetryCount,
    timeoutMs: env.deepseekTimeoutMs,
    backoffMs: env.deepseekBackoffMs,
  });
  const aiJson = parseAiReportJson(rawAiResponse);
  const markdown = renderReportMarkdown(aiJson);
  const result = buildReportResult({
    markdown,
    warnings,
    stats: {
      repoCount,
      commitCount: commits.length,
      thoughtLength: thoughts.length,
    },
  });
  const outputPath = writeReportToFile(result.reportFileName, result.markdown);

  logInfo("Weekly report generation completed.", {
    elapsedMs: Date.now() - start,
    outputPath,
    warningCount: warnings.length,
  });

  return {
    ...result,
    outputPath,
  };
};
