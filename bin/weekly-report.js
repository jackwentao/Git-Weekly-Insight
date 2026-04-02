#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");

const cliPath = path.resolve(__dirname, "../src/bin/cli.ts");
const args = process.argv.slice(2);
const forwardedArgs = args.length > 0 ? args : ["generate"];

const child = spawn(process.execPath, ["--import", "tsx", cliPath, ...forwardedArgs], {
  stdio: "inherit",
  cwd: process.cwd(),
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
