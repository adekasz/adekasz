import OpenAI from "openai";
import type { Config } from "./config.js";

/** Keeps short-lived conversation continuity. Replace with Redis or a database in production. */
export class WhatsAppAgent {
  private readonly client: OpenAI;
  private readonly previousResponses = new Map<string, string>();
  constructor(private readonly config: Config) { this.client = new OpenAI({ apiKey: config.openAiApiKey }); }
  async reply(sender: string, message: string): Promise<string> {
    const response = await this.client.responses.create({ model: this.config.openAiModel, instructions: this.config.systemPrompt, input: message, previous_response_id: this.previousResponses.get(sender) });
    this.previousResponses.set(sender, response.id);
    return response.output_text.trim() || "Sorry, I couldn't generate a response. Please try again.";
  }
}
