import fs from "node:fs";

export const readThoughts = (thoughtPath?: string): string => {
  if (!thoughtPath) {
    return "";
  }

  if (!fs.existsSync(thoughtPath)) {
    return "";
  }

  return fs.readFileSync(thoughtPath, "utf-8").trim();
};
