import { createHmac, timingSafeEqual } from "node:crypto";

export const isValidSignature = (rawBody: Buffer, signature: string | undefined, appSecret: string): boolean => {
  if (!signature?.startsWith("sha256=")) return false;
  const received = Buffer.from(signature.slice("sha256=".length), "hex");
  const expected = Buffer.from(createHmac("sha256", appSecret).update(rawBody).digest("hex"), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
};
