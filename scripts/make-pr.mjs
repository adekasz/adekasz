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
  --repo <owner/repo>   Target repository when no git remote is configured
  --draft               Create a draft pull request
  --dry-run             Print the GitHub CLI command without creating a PR
  --help                Show this help message`;

export const buildPrCommand = (argv) => {
  const { values } = parseArgs({
    args: argv,
    options: {
      base: { type: "string" },
      body: { type: "string" },
      "body-file": { type: "string" },
      draft: { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", default: false },
      repo: { type: "string" },
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
  if (values.repo) command.push("--repo", values.repo);
  if (values.draft) command.push("--draft");
  return { command, dryRun: values["dry-run"], help: false };
};

const run = (command, args, options = {}) => spawnSync(command, args, options);

const failed = (result) => result.error || result.status !== 0;

const hasOrigin = (execute) => !failed(execute("git", ["remote", "get-url", "origin"], { stdio: "ignore" }));

const requirePrerequisites = (parsed, execute) => {
  if (!parsed.command.includes("--repo") && !hasOrigin(execute)) {
    console.error("No 'origin' remote found. Add one or provide --repo owner/repo.");
    return false;
  }
  if (failed(execute("gh", ["auth", "status"], { stdio: "ignore" }))) {
    console.error("GitHub CLI is not authenticated. Run 'gh auth login' or set GH_TOKEN.");
    return false;
  }
  return true;
};

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

  if (parsed.dryRun) {
    console.log(`gh ${parsed.command.map((argument) => JSON.stringify(argument)).join(" ")}`);
    return 0;
  }

  const cleanStatus = execute("git", ["status", "--porcelain"], { encoding: "utf8" });
  if (failed(cleanStatus)) return cleanStatus.status ?? 1;
  if (cleanStatus.stdout.trim()) {
    console.error("Refusing to create a PR with uncommitted changes. Commit or stash them first.");
    return 2;
  }

  if (!requirePrerequisites(parsed, execute)) return 2;

  const result = execute("gh", parsed.command, { stdio: "inherit" });
  return result.status ?? 1;
};

if (process.argv[1] === new URL(import.meta.url).pathname) process.exitCode = main(process.argv.slice(2));
