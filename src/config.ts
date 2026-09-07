import "dotenv/config";

export type Config = {
  openAiApiKey: string; openAiModel: string; port: number; systemPrompt: string;
  whatsappAccessToken: string; whatsappApiVersion: string; whatsappAppSecret: string;
  whatsappPhoneNumberId: string; whatsappVerifyToken: string;
};

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

export const loadConfig = (): Config => ({
  openAiApiKey: required("OPENAI_API_KEY"),
  openAiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  port: Number(process.env.PORT ?? 3000),
  systemPrompt: process.env.SYSTEM_PROMPT ?? "You are a helpful WhatsApp assistant. Be concise, friendly, and accurate.",
  whatsappAccessToken: required("WHATSAPP_ACCESS_TOKEN"),
  whatsappApiVersion: process.env.WHATSAPP_API_VERSION ?? "v23.0",
  whatsappAppSecret: required("WHATSAPP_APP_SECRET"),
  whatsappPhoneNumberId: required("WHATSAPP_PHONE_NUMBER_ID"),
  whatsappVerifyToken: required("WHATSAPP_VERIFY_TOKEN"),
});
