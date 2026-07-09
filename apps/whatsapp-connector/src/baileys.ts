import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import P from "pino";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";

const AUTH_STATE_DIR = process.env.WHATSAPP_AUTH_DIR ?? "./auth_state";

export type MessageHandler = (from: string, text: string) => void | Promise<void>;
export type SocketUpdateHandler = (sock: WASocket | null) => void;

// Baileys ships a hardcoded WA protocol version that WhatsApp's servers
// periodically stop accepting (rejecting the WS upgrade with a 405). Resolve
// it dynamically on every (re)connect instead of trusting the package
// default; `WHATSAPP_WA_VERSION` (JSON array, e.g. "[2,3000,1037641644]")
// lets ops override it without a deploy if WhatsApp rotates faster than
// Baileys' own version-check endpoint keeps up — see WhiskeySockets/Baileys#2376.
async function resolveWaVersion(): Promise<[number, number, number] | undefined> {
  const override = process.env.WHATSAPP_WA_VERSION;
  if (override) {
    try {
      return JSON.parse(override);
    } catch {
      console.warn("WHATSAPP_WA_VERSION inválido, ignorando override.");
    }
  }
  try {
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Usando versão do protocolo WA: ${version.join(".")} (isLatest: ${isLatest})`);
    return version as [number, number, number];
  } catch (error) {
    console.warn("Falha ao buscar versão do protocolo WA, usando o padrão do pacote:", error);
    return undefined;
  }
}

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
  const version = await resolveWaVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    logger: P({ level: "silent" }) as unknown as never,
  });

  onSocketUpdate(sock);
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Escaneie o QR code abaixo com o WhatsApp (Aparelhos conectados):");
      qrcode.generate(qr, { small: true });
      void QRCode.toFile("./whatsapp-qr.png", qr, { width: 400 }).catch((error) =>
        console.error("Falha ao salvar QR code como imagem:", error),
      );
    }

    if (connection === "close") {
      onSocketUpdate(null);
      const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`Conexão encerrada (status ${statusCode}). Reconectar: ${shouldReconnect}`);
      if (shouldReconnect) {
        // Small backoff so a persistent server-side rejection (e.g. a stale
        // WA protocol version) doesn't hammer WhatsApp with instant retries.
        setTimeout(() => void connectWhatsApp(onMessage, onSocketUpdate), 3000);
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
