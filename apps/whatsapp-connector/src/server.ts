import express, { type Express } from "express";
import type { WASocket } from "@whiskeysockets/baileys";
import { checkNumbersOnWhatsApp, sendWhatsAppMessage } from "./baileys.js";

export function createServer(getSocket: () => WASocket | null, connectorSecret: string): Express {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    const sock = getSocket();
    res.json({ connected: Boolean(sock?.user), user: sock?.user?.id ?? null });
  });

  app.post("/send", async (req, res) => {
    if (req.headers["x-connector-secret"] !== connectorSecret) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { to, text } = req.body as { to?: string; text?: string };
    if (!to || !text) {
      res.status(400).json({ error: "'to' e 'text' são obrigatórios." });
      return;
    }

    const sock = getSocket();
    if (!sock) {
      res.status(503).json({ error: "WhatsApp não conectado ainda." });
      return;
    }

    try {
      await sendWhatsAppMessage(sock, to, text);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  app.post("/check-numbers", async (req, res) => {
    if (req.headers["x-connector-secret"] !== connectorSecret) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { phones } = req.body as { phones?: string[] };
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      res.status(400).json({ error: "'phones' (array) é obrigatório." });
      return;
    }

    const sock = getSocket();
    if (!sock) {
      res.status(503).json({ error: "WhatsApp não conectado ainda." });
      return;
    }

    try {
      const results = await checkNumbersOnWhatsApp(sock, phones);
      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
    }
  });

  return app;
}
