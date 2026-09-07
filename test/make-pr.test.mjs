import assert from "node:assert/strict";
import test from "node:test";
import { buildPrCommand } from "../scripts/make-pr.mjs";

test("builds a GitHub CLI pull-request command", () => {
  assert.deepEqual(buildPrCommand(["--title", "Add agent", "--body", "Summary", "--base", "main"]), {
    command: ["pr", "create", "--title", "Add agent", "--body", "Summary", "--base", "main"],
    help: false,
  });
});

test("supports body files and drafts", () => {
  assert.deepEqual(buildPrCommand(["--title", "Add agent", "--body-file", "PR.md", "--draft"]), {
    command: ["pr", "create", "--title", "Add agent", "--body-file", "PR.md", "--draft"],
    help: false,
  });
});

test("requires exactly one body option", () => {
  assert.throws(() => buildPrCommand(["--title", "Add agent"]), /Provide --body or --body-file/);
  assert.throws(() => buildPrCommand(["--title", "Add agent", "--body", "A", "--body-file", "PR.md"]), /Use only one/);
});
