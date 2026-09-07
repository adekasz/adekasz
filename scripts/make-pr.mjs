#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { parseArgs } from "node:util";

const usage = `Usage: npm run make-pr -- --title <title> (--body <text> | --body-file <path>) [options]

Create a GitHub pull request from the current branch using the GitHub CLI.

Options:
  --title <title>       Pull request title (required)
  --body <text>         Pull request body text
  --body-file <path>    File containing the pull request body
  --base <branch>       Base branch (uses the repository default when omitted)
  --draft               Create a draft pull request
  --help                Show this help message`;

export const buildPrCommand = (argv) => {
  const { values } = parseArgs({
    args: argv,
    options: {
      base: { type: "string" },
      body: { type: "string" },
      "body-file": { type: "string" },
      draft: { type: "boolean", default: false },
      help: { type: "boolean", default: false },
      title: { type: "string" },
    },
    strict: true,
  });

  if (values.help) return { help: true };
  if (!values.title) throw new Error("--title is required.");
  if (!values.body && !values["body-file"]) throw new Error("Provide --body or --body-file.");
  if (values.body && values["body-file"]) throw new Error("Use only one of --body and --body-file.");

  const command = ["pr", "create", "--title", values.title];
  if (values.body) command.push("--body", values.body);
  if (values["body-file"]) command.push("--body-file", values["body-file"]);
  if (values.base) command.push("--base", values.base);
  if (values.draft) command.push("--draft");
  return { command, help: false };
};

const run = (command, args) => spawnSync(command, args, { stdio: "inherit" });

export const main = (argv, execute = run) => {
  let parsed;
  try {
    parsed = buildPrCommand(argv);
  } catch (error) {
    console.error(`${error.message}\n\n${usage}`);
    return 2;
  }

  if (parsed.help) {
    console.log(usage);
    return 0;
  }

  const cleanStatus = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  if (cleanStatus.status !== 0) return cleanStatus.status ?? 1;
  if (cleanStatus.stdout.trim()) {
    console.error("Refusing to create a PR with uncommitted changes. Commit or stash them first.");
    return 2;
  }

  const result = execute("gh", parsed.command);
  return result.status ?? 1;
};

if (process.argv[1] === new URL(import.meta.url).pathname) process.exitCode = main(process.argv.slice(2));
