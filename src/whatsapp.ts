import type { Config } from "./config.js";

export type IncomingTextMessage = { id: string; from: string; text: string };
type WebhookPayload = { entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ id?: string; from?: string; type?: string; text?: { body?: string } }> } }> }> };

export const textMessagesFromWebhook = (payload: WebhookPayload): IncomingTextMessage[] =>
  (payload.entry ?? []).flatMap((entry) => (entry.changes ?? []).flatMap((change) =>
    (change.value?.messages ?? []).flatMap((message) => {
      if (message.type !== "text" || !message.id || !message.from || !message.text?.body) return [];
      return [{ id: message.id, from: message.from, text: message.text.body }];
    })));

export const sendTextMessage = async (config: Config, recipient: string, body: string): Promise<void> => {
  const response = await fetch(`https://graph.facebook.com/${config.whatsappApiVersion}/${config.whatsappPhoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.whatsappAccessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: recipient, type: "text", text: { preview_url: false, body } }),
  });
  if (!response.ok) throw new Error(`WhatsApp API error (${response.status}): ${await response.text()}`);
};
