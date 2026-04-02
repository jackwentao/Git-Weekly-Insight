import type { WeeklyReportResult } from "@/types/report";

export interface GenerateSuccessOutput {
  ok: true;
  data: WeeklyReportResult;
}

export interface GenerateErrorOutput {
  ok: false;
  error: {
    message: string;
  };
}

export type GeneratePublicOutput = GenerateSuccessOutput | GenerateErrorOutput;

export const buildGenerateSuccessOutput = (result: WeeklyReportResult): GenerateSuccessOutput => ({
  ok: true,
  data: result,
});

export const buildGenerateErrorOutput = (message: string): GenerateErrorOutput => ({
  ok: false,
  error: { message },
});
