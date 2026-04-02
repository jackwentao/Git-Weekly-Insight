import type { WeeklyReportInput } from "@/types/report";

export const buildWeeklyPrompt = ({ commits, thoughts, sinceDays }: WeeklyReportInput): string => {
  const commitLines = commits.map(
    (commit) =>
      `- [${commit.repoName}] ${commit.message} (${commit.hash.slice(0, 7)} by ${commit.author} at ${commit.committedAt})`,
  );

  return [
    "Role: 资深技术负责人 & 产品专家",
    "Task:",
    "1) 清洗无意义提交（merge/typo/lint/格式化等）",
    "2) 分类为：新功能开发、性能优化、Bug 修复、下周计划",
    "3) 兼顾业务进展与技术实现细节",
    "4) 输出严格 JSON，不要输出 Markdown，不要输出解释文字",
    `统计时间范围：最近 ${sinceDays} 天`,
    "",
    "Git Commits:",
    ...commitLines,
    "",
    "Thought Notes:",
    thoughts || "(empty)",
    "",
    "Output JSON Schema:",
    "{",
    '  "weekSummary": "string",',
    '  "businessProgress": ["string"],',
    '  "technicalImplementation": ["string"],',
    '  "risksAndBlockers": ["string"],',
    '  "nextWeekPlan": ["string"]',
    "}",
    "",
    "Rules:",
    "- 只返回 JSON 对象",
    "- 所有数组至少给出 1 条内容，若无信息则写\"暂无\"",
    "- 使用中文输出",
  ].join("\n");
};
