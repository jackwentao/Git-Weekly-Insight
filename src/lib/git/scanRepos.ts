import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import type { CommitItem, ReportWarning } from "@/types/report";

const hasGitFolder = (dirPath: string): boolean =>
  fs.existsSync(path.join(dirPath, ".git"));

const listGitRepos = (rootDir: string): string[] => {
  const repos: string[] = [];

  const walk = (currentPath: string) => {
    if (hasGitFolder(currentPath)) {
      repos.push(currentPath);
      return;
    }

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }

      walk(path.join(currentPath, entry.name));
    }
  };

  walk(rootDir);

  return repos;
};

export interface GitCollectResult {
  commits: CommitItem[];
  repoCount: number;
  warnings: ReportWarning[];
}

const COMMIT_FIELD_SEPARATOR = "\u001f";

export const collectWeeklyCommits = (rootDir: string, sinceDays = 7): GitCollectResult => {
  const repos = listGitRepos(rootDir);
  const commits: CommitItem[] = [];
  const warnings: ReportWarning[] = [];

  for (const repoPath of repos) {
    const repoName = path.basename(repoPath);
    const format = `%H%x1f%an%x1f%ad%x1f%s`;
    const command = `git -C "${repoPath}" log --since="${sinceDays} days ago" --no-merges --pretty=format:"${format}"`;

    let output = "";
    try {
      output = execSync(command, { encoding: "utf-8", timeout: 5000 }).trim();
    } catch {
      warnings.push({
        scope: "repo",
        message: "Failed to read git log for repository.",
        repoPath,
      });
      continue;
    }

    if (!output) {
      continue;
    }

    for (const line of output.split("\n")) {
      const [hash, author, committedAt, message] = line.split(COMMIT_FIELD_SEPARATOR);
      if (!hash || !message) {
        warnings.push({
          scope: "repo",
          message: "Skipped malformed git log line.",
          repoPath,
        });
        continue;
      }

      commits.push({
        repoName,
        hash,
        author: author ?? "unknown",
        committedAt: committedAt ?? "",
        message,
      });
    }
  }

  return {
    commits,
    repoCount: repos.length,
    warnings,
  };
};

export const getWeeklyCommits = (rootDir: string, sinceDays = 7): CommitItem[] => {
  return collectWeeklyCommits(rootDir, sinceDays).commits;
};
