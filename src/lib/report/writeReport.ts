import fs from "node:fs";
import path from "node:path";

export const writeReportToFile = (fileName: string, markdown: string): string => {
  const outputDir = path.join(process.cwd(), "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fullPath = path.join(outputDir, fileName);
  fs.writeFileSync(fullPath, markdown, "utf-8");
  return fullPath;
};
