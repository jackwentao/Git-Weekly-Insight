import { NextResponse } from "next/server";

import { generateWeeklyReport } from "@/lib/report/generateWeeklyReport";
import { buildGenerateErrorOutput, buildGenerateSuccessOutput } from "@/lib/report/publicOutput";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    const result = await generateWeeklyReport();
    return NextResponse.json(buildGenerateSuccessOutput(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(buildGenerateErrorOutput(message), { status: 500 });
  }
};
