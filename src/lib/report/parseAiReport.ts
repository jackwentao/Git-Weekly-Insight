import type { AiReportJson } from "@/types/aiReport";

const ensureStringArray = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Invalid AI JSON field: ${field} should be string[]`);
  }

  return value;
};

const stripCodeFence = (raw: string): string => {
  const text = raw.trim();
  if (text.startsWith("```")) {
    return text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }

  return text;
};

export const parseAiReportJson = (rawContent: string): AiReportJson => {
  const normalized = stripCodeFence(rawContent);

  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error("AI output is not valid JSON.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("AI output JSON must be an object.");
  }

  const record = parsed as Record<string, unknown>;

  if (typeof record.weekSummary !== "string") {
    throw new Error("Invalid AI JSON field: weekSummary should be string.");
  }

  return {
    weekSummary: record.weekSummary,
    businessProgress: ensureStringArray(record.businessProgress, "businessProgress"),
    technicalImplementation: ensureStringArray(record.technicalImplementation, "technicalImplementation"),
    risksAndBlockers: ensureStringArray(record.risksAndBlockers, "risksAndBlockers"),
    nextWeekPlan: ensureStringArray(record.nextWeekPlan, "nextWeekPlan"),
  };
};
