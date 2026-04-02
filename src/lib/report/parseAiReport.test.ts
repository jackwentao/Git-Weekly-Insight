import test from "node:test";
import assert from "node:assert/strict";

import { parseAiReportJson } from "@/lib/report/parseAiReport";

test("parseAiReportJson parses valid JSON payload", () => {
  const raw = JSON.stringify({
    weekSummary: "完成核心周报链路",
    businessProgress: ["提升周报输出效率"],
    technicalImplementation: ["实现 CLI 和 API 适配"],
    risksAndBlockers: ["暂无"],
    nextWeekPlan: ["补充测试"],
  });

  const parsed = parseAiReportJson(raw);
  assert.equal(parsed.weekSummary, "完成核心周报链路");
  assert.equal(parsed.businessProgress.length, 1);
});

test("parseAiReportJson throws on malformed JSON payload", () => {
  assert.throws(() => parseAiReportJson("not-json"), /not valid JSON/i);
});
