# whatsapp-connector

Ponte entre o WhatsApp (via [Baileys](https://github.com/WhiskeySockets/Baileys), integração **não-oficial** — ver [ADR 0005](../../docs/architecture/0005-whatsapp-unofficial-baileys.md)) e a Edge Function `whatsapp-webhook`. Processo Node.js que roda continuamente — não é serverless.

## Rodando localmente

```bash
cd apps/whatsapp-connector
npm install
cp .env.example .env   # preencher WHATSAPP_CONNECTOR_SECRET e SUPABASE_WEBHOOK_URL
npm run dev
```

Na primeira execução, um QR code aparece no terminal — escaneie com o WhatsApp do número que vai representar a Ademicon (Configurações → Aparelhos conectados → Conectar um aparelho). A sessão fica salva em `./auth_state` (não versionada — está no `.gitignore`).

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `WHATSAPP_CONNECTOR_SECRET` | Segredo compartilhado com a Edge Function (mesmo valor dos dois lados). |
| `SUPABASE_WEBHOOK_URL` | URL da function, ex.: `https://yskziaagegaqcdlqqniw.supabase.co/functions/v1/whatsapp-webhook` |
| `WHATSAPP_AUTH_DIR` | Onde persistir a sessão do Baileys (aponte para um volume persistente em produção). |
| `PORT` | Porta do servidor HTTP (padrão 3001). |

## Deploy (Railway)

1. Crie um novo projeto no [Railway](https://railway.app) a partir deste repositório, apontando o **Root Directory** para `apps/whatsapp-connector`.
2. Configure as variáveis de ambiente acima nas Settings do serviço.
3. Adicione um **Volume** montado em `/app/auth_state` (ou o caminho de `WHATSAPP_AUTH_DIR`) — sem isso, todo redeploy exige escanear o QR code de novo.
4. Deploy. Acompanhe os logs para escanear o QR code na primeira vez.
5. Depois de conectado, copie a URL pública do serviço (ex.: `https://whatsapp-connector-production.up.railway.app`) e configure `WHATSAPP_CONNECTOR_URL` como secret na Edge Function `whatsapp-webhook` (Supabase Dashboard → Edge Functions → whatsapp-webhook → Secrets).

## Endpoints

- `GET /health` — `{ connected: boolean, user: string | null }`, sem autenticação (para health check da plataforma de hospedagem).
- `POST /send` — `{ to: string, text: string }`, autenticado via header `x-connector-secret`. Usado pela Edge Function para responder ao lead.
