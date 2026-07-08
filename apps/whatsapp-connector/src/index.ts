import "dotenv/config";
import type { WASocket } from "@whiskeysockets/baileys";
import { connectWhatsApp } from "./baileys.js";
import { createServer } from "./server.js";

const PORT = Number(process.env.PORT ?? 3001);
const CONNECTOR_SECRET = process.env.WHATSAPP_CONNECTOR_SECRET;
const WEBHOOK_URL = process.env.SUPABASE_WEBHOOK_URL;

if (!CONNECTOR_SECRET) {
  throw new Error("WHATSAPP_CONNECTOR_SECRET não definido no ambiente.");
}
if (!WEBHOOK_URL) {
  throw new Error("SUPABASE_WEBHOOK_URL não definido no ambiente.");
}

let currentSocket: WASocket | null = null;

async function forwardToWebhook(from: string, text: string): Promise<void> {
  try {
    const response = await fetch(WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-connector-secret": CONNECTOR_SECRET! },
      body: JSON.stringify({ from, text }),
    });
    if (!response.ok) {
      console.error("whatsapp-webhook respondeu com erro:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Falha ao encaminhar mensagem para a Edge Function:", error);
  }
}

void connectWhatsApp(
  (from, text) => forwardToWebhook(from, text),
  (sock) => {
    currentSocket = sock;
  },
);

const app = createServer(() => currentSocket, CONNECTOR_SECRET);
app.listen(PORT, () => console.log(`whatsapp-connector ouvindo na porta ${PORT}`));
