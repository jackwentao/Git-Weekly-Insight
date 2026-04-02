export type CommitCategory =
  | "new-feature"
  | "performance"
  | "bug-fix"
  | "next-plan"
  | "other";

export interface CommitItem {
  repoName: string;
  message: string;
  hash: string;
  author: string;
  committedAt: string;
  category?: CommitCategory;
}

export interface ReportWarning {
  scope: "config" | "repo" | "notes" | "ai" | "system";
  message: string;
  repoPath?: string;
}

export interface WeeklyReportInput {
  commits: CommitItem[];
  thoughts: string;
  sinceDays: number;
}

export interface WeeklyReportResult {
  markdown: string;
  generatedAt: string;
  reportFileName: string;
  outputPath?: string;
  warnings: ReportWarning[];
  stats: {
    repoCount: number;
    commitCount: number;
    thoughtLength: number;
  };
}
