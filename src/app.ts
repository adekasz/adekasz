import express from "express";
import type { Config } from "./config.js";
import { isValidSignature } from "./signature.js";
import { textMessagesFromWebhook, sendTextMessage } from "./whatsapp.js";

export type Agent = { reply(sender: string, message: string): Promise<string> };
export const createApp = (config: Config, agent: Agent) => {
  const app = express();
  const processedMessageIds = new Set<string>();
  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.get("/webhook", (request, response) => {
    const mode = request.query["hub.mode"], token = request.query["hub.verify_token"], challenge = request.query["hub.challenge"];
    if (mode === "subscribe" && token === config.whatsappVerifyToken && typeof challenge === "string") return response.status(200).send(challenge);
    return response.sendStatus(403);
  });
  app.post("/webhook", express.raw({ type: "application/json" }), (request, response) => {
    const rawBody = request.body as Buffer;
    if (!isValidSignature(rawBody, request.header("x-hub-signature-256"), config.whatsappAppSecret)) return response.sendStatus(401);
    response.sendStatus(200);
    const payload = JSON.parse(rawBody.toString("utf8"));
    for (const message of textMessagesFromWebhook(payload)) {
      if (processedMessageIds.has(message.id)) continue;
      processedMessageIds.add(message.id);
      void agent.reply(message.from, message.text).then((reply) => sendTextMessage(config, message.from, reply)).catch((error: unknown) => console.error("Unable to process WhatsApp message", error));
    }
  });
  return app;
};
