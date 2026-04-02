import test from "node:test";
import assert from "node:assert/strict";

import { buildGenerateSuccessOutput } from "@/lib/report/publicOutput";
import type { WeeklyReportResult } from "@/types/report";

test("generate success output contract is deterministic for parity", () => {
  const sample: WeeklyReportResult = {
    markdown: "# 本周工作总结\n",
    generatedAt: "2026-04-02T00:00:00.000Z",
    reportFileName: "Weekly_Report_2026_W14.md",
    outputPath: "D:/Project/output/Weekly_Report_2026_W14.md",
    warnings: [],
    stats: {
      repoCount: 2,
      commitCount: 10,
      thoughtLength: 100,
    },
  };

  const apiShape = buildGenerateSuccessOutput(sample);
  const cliShape = buildGenerateSuccessOutput(sample);

  assert.deepEqual(cliShape, apiShape);
  assert.equal(cliShape.ok, true);
  assert.equal(cliShape.data.reportFileName, "Weekly_Report_2026_W14.md");
});
