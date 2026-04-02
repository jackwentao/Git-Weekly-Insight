import type { ReportWarning, WeeklyReportResult } from "@/types/report";
import type { AiReportJson } from "@/types/aiReport";

const getIsoWeek = (date: Date): { year: number; week: number } => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return { year: utcDate.getUTCFullYear(), week };
};

const getIsoWeekFileName = (): string => {
  const now = new Date();
  const { year, week } = getIsoWeek(now);
  const paddedWeek = String(week).padStart(2, "0");
  return `Weekly_Report_${year}_W${paddedWeek}.md`;
};

const renderList = (items: string[]): string => items.map((item) => `- ${item}`).join("\n");

export const renderReportMarkdown = (report: AiReportJson): string => {
  return [
    "# 本周工作总结",
    report.weekSummary,
    "",
    "## 业务进展",
    renderList(report.businessProgress),
    "",
    "## 技术实现",
    renderList(report.technicalImplementation),
    "",
    "## 风险与阻塞",
    renderList(report.risksAndBlockers),
    "",
    "## 下周计划",
    renderList(report.nextWeekPlan),
  ].join("\n");
};

interface BuildReportResultInput {
  markdown: string;
  warnings: ReportWarning[];
  stats: {
    repoCount: number;
    commitCount: number;
    thoughtLength: number;
  };
}

export const buildReportResult = ({ markdown, warnings, stats }: BuildReportResultInput): WeeklyReportResult => ({
  markdown,
  generatedAt: new Date().toISOString(),
  reportFileName: getIsoWeekFileName(),
  warnings,
  stats,
});
