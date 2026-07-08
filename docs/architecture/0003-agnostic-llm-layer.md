# ADR 0003 — Camada agnóstica de provedor de LLM

## Status
Aceito.

## Contexto
A IA Comercial (Fase 4) precisa conversar via WhatsApp, classificar leads, responder objeções e gerar resumos. O provedor de LLM (Claude/Anthropic vs. OpenAI) é uma decisão que pode mudar por custo, qualidade ou disponibilidade — a aplicação não deveria precisar de refactor para trocar de provedor.

## Decisão
`packages/ai-providers` define uma interface `LlmProvider` única (`generateResponse`/`callWithTools`), com implementações concretas por provedor construídas sobre o Vercel AI SDK. Uma `ProviderFactory` resolve o provedor ativo a partir de configuração (`AI_PROVIDER` hoje; possivelmente por organização no futuro, via `organizations.settings`).

## Consequências
- Trocar de provedor é mudar uma variável de ambiente, não código de aplicação.
- Prompts ficam versionados em `ai_prompt_templates` (banco) + arquivos-base no pacote, permitindo ajuste fino e A/B testing por versão sem deploy.
- Nesta fase (Fase 0) apenas a interface e o esqueleto do `ProviderFactory` existem — a implementação concreta dos providers e a integração com WhatsApp chegam na Fase 4, quando as credenciais dos provedores estiverem disponíveis.
- "Aprendizado contínuo" é feedback supervisionado (correções viram exemplos few-shot) + prompt versioning com métricas — deliberadamente não é fine-tuning de modelo, que não é viável/custo-efetivo para este caso de uso.
