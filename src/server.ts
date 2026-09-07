import { WhatsAppAgent } from "./agent.js";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
createApp(config, new WhatsAppAgent(config)).listen(config.port, () => console.log(`WhatsApp AI agent listening on port ${config.port}`));
