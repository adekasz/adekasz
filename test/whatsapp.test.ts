import assert from "node:assert/strict";
import test from "node:test";
import { textMessagesFromWebhook } from "../src/whatsapp.js";

test("extracts only complete incoming text messages", () => {
  const messages = textMessagesFromWebhook({ entry: [{ changes: [{ value: { messages: [
    { id: "one", from: "15551234567", type: "text", text: { body: "Hello" } }, { id: "two", from: "15557654321", type: "image" },
  ] } }] }] });
  assert.deepEqual(messages, [{ id: "one", from: "15551234567", text: "Hello" }]);
});
