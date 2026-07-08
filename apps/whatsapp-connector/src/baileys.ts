import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import P from "pino";
import qrcode from "qrcode-terminal";

const AUTH_STATE_DIR = process.env.WHATSAPP_AUTH_DIR ?? "./auth_state";

export type MessageHandler = (from: string, text: string) => void | Promise<void>;
export type SocketUpdateHandler = (sock: WASocket | null) => void;

/**
 * Connects to WhatsApp via Baileys (see ADR 0005). Auth state persists to
 * `AUTH_STATE_DIR` so a redeploy doesn't require re-scanning the QR code —
 * that directory MUST be a persistent volume in whatever host runs this.
 */
export async function connectWhatsApp(
  onMessage: MessageHandler,
  onSocketUpdate: SocketUpdateHandler,
): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_STATE_DIR);

  const sock = makeWASocket({
    auth: state,
    logger: P({ level: "silent" }) as unknown as never,
  });

  onSocketUpdate(sock);
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Escaneie o QR code abaixo com o WhatsApp (Aparelhos conectados):");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      onSocketUpdate(null);
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexão encerrada (status ${statusCode}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) {
        void connectWhatsApp(onMessage, onSocketUpdate);
      } else {
        console.error("Sessão desconectada (logout). Apague a pasta de auth e escaneie o QR novamente.");
      }
    } else if (connection === "open") {
      console.log("WhatsApp conectado.");
    }
  });

  sock.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      const text = msg.message?.conversation ?? msg.message?.extendedTextMessage?.text;
      const from = msg.key.remoteJid;
      if (!text || !from) continue;
      void onMessage(from, text);
    }
  });
}

export async function sendWhatsAppMessage(sock: WASocket, to: string, text: string): Promise<void> {
  const jid = to.includes("@") ? to : `${to}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}
