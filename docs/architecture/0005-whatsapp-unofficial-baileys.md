# ADR 0005 — WhatsApp via Baileys (não-oficial) em vez da Cloud API

## Status
Aceito.

## Contexto
ADR original (ver plano da Fase 0) previa a WhatsApp Business Cloud API (Meta) ou um BSP (360dialog/Twilio) como canal da IA Comercial. A Ademicon optou, por decisão de negócio, por **não** usar a API oficial nesta fase — preferindo uma integração não-oficial via automação do protocolo WhatsApp Web.

## Decisão
Usar **Baileys** (`@whiskeysockets/baileys`), a biblioteca TypeScript mais madura para esse fim: conecta via WebSocket diretamente no protocolo multi-device do WhatsApp Web (sem precisar de um navegador/Puppeteer), exigindo apenas a leitura de um QR code uma vez para vincular o número.

### Risco assumido (comunicado e aceito pelo cliente)
Automação não-oficial viola os Termos de Serviço do WhatsApp. O número pode ser banido a qualquer momento, sem aviso prévio, por decisão unilateral da Meta. Diferente da Cloud API oficial, não há SLA, suporte ou garantia de continuidade. Esta é uma decisão de negócio da Ademicon, não uma recomendação técnica — a arquitetura foi desenhada para minimizar o custo de eventualmente migrar para a Cloud API oficial no futuro (ver "Consequências" abaixo).

## Arquitetura

Bibliotecas não-oficiais exigem um processo mantendo uma conexão persistente com o WhatsApp — isso **não roda em Supabase Edge Functions** (que são sem estado, de vida curta). A solução:

```
WhatsApp  <--WebSocket-->  apps/whatsapp-connector (Node.js persistente, Baileys)
                                      |  HTTP (mensagem recebida)
                                      v
                    supabase/functions/whatsapp-webhook (Edge Function)
                                      |  chama de volta via HTTP (mensagem a enviar)
                                      v
                          apps/whatsapp-connector  --WebSocket-->  WhatsApp
```

- **`apps/whatsapp-connector`**: serviço Node.js dedicado (fora do Next.js, roda 24/7 em um host com processo persistente — ver ADR de hospedagem). Responsabilidades:
  - Mantém a sessão Baileys (QR code escaneado uma vez; estado de auth persistido em disco/volume para sobreviver a reinícios).
  - Ao receber mensagem: normaliza o payload e faz `POST` autenticado (header `x-connector-secret`) para a Edge Function `whatsapp-webhook` — **o mesmo papel que o webhook da Meta teria**, então o restante do pipeline (schema de `conversations`/`messages`, `packages/ai-providers`, `ai_decisions`) é reaproveitado sem alteração.
  - Expõe `POST /send` (autenticado) para a Edge Function pedir o envio de uma resposta.
- **`supabase/functions/whatsapp-webhook`**: inalterado em intenção do plano original — upsert de lead por telefone, grava mensagem, chama o orquestrador de IA (`packages/ai-providers`), executa tool calls, grava `ai_decisions`, pede ao connector para enviar a resposta.

## Consequências

- **Migração futura para a Cloud API oficial fica barata**: a Edge Function `whatsapp-webhook` já fala um "protocolo" próprio (payload normalizado + endpoint de envio) desacoplado do transporte. Trocar Baileys pela Cloud API oficial no futuro significa reescrever só a camada de transporte (o `whatsapp-connector` vira um handler de webhook da Meta), sem tocar em lead matching, IA, tools ou `ai_decisions`.
- **Hospedagem**: precisa de um processo Node sempre ativo (não serverless). Recomendado um serviço simples tipo Railway/Fly.io com volume persistente para a sessão do Baileys, evitando reescanear o QR a cada deploy.
- **Disponibilidade**: se a sessão cair (ex.: WhatsApp desconectado remotamente, número banido), o canal para até reconexão manual — monitoramento básico (`GET /health` no connector) é necessário operacionalmente.
- Nesta fase, sem chave da Anthropic ainda disponível, `ProviderFactory` usa um `MockProvider` determinístico por padrão; o `AnthropicProvider` real já está implementado e é ativado assim que a variável `ANTHROPIC_API_KEY` existir.
