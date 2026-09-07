import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { isValidSignature } from "../src/signature.js";

test("accepts a valid Meta webhook signature", () => {
  const rawBody = Buffer.from('{"object":"whatsapp_business_account"}'), secret = "test-secret";
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  assert.equal(isValidSignature(rawBody, `sha256=${digest}`, secret), true);
});
test("rejects absent or incorrect signatures", () => {
  const rawBody = Buffer.from("payload");
  assert.equal(isValidSignature(rawBody, undefined, "secret"), false);
  assert.equal(isValidSignature(rawBody, "sha256=abcd", "secret"), false);
});
