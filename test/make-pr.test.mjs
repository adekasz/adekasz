import assert from "node:assert/strict";
import test from "node:test";
import { buildPrCommand, main } from "../scripts/make-pr.mjs";

test("builds a GitHub CLI pull-request command", () => {
  assert.deepEqual(buildPrCommand(["--title", "Add agent", "--body", "Summary", "--base", "main"]), {
    command: ["pr", "create", "--title", "Add agent", "--body", "Summary", "--base", "main"],
    dryRun: false,
    help: false,
  });
});

test("supports body files and drafts", () => {
  assert.deepEqual(buildPrCommand(["--title", "Add agent", "--body-file", "PR.md", "--draft"]), {
    command: ["pr", "create", "--title", "Add agent", "--body-file", "PR.md", "--draft"],
    dryRun: false,
    help: false,
  });
});

test("supports selecting a repository and dry runs", () => {
  assert.deepEqual(buildPrCommand(["--title", "Add agent", "--body", "Summary", "--repo", "octo/example", "--dry-run"]), {
    command: ["pr", "create", "--title", "Add agent", "--body", "Summary", "--repo", "octo/example"],
    dryRun: true,
    help: false,
  });
});

test("requires exactly one body option", () => {
  assert.throws(() => buildPrCommand(["--title", "Add agent"]), /Provide --body or --body-file/);
  assert.throws(() => buildPrCommand(["--title", "Add agent", "--body", "A", "--body-file", "PR.md"]), /Use only one/);
});

test("dry runs without invoking Git or GitHub", () => {
  const calls = [];
  const execute = (command, args) => {
    calls.push([command, args]);
    return { status: 0, stdout: "" };
  };

  assert.equal(main(["--title", "Add agent", "--body", "Summary", "--dry-run"], execute), 0);
  assert.deepEqual(calls, []);
});
