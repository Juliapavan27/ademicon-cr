# Ademicon CRM

Plataforma SaaS de prospecção comercial com IA da Ademicon: importação e qualificação de leads, conversas humanizadas via WhatsApp, agendamento, distribuição inteligente de reuniões, gestão de parceiros, CRM e dashboards em tempo real.

## Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion, TanStack Query
- **Backend**: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- **Arquitetura**: Clean Architecture por feature (domain / repository / service / hooks), monorepo Turborepo + pnpm

## Estrutura

```
apps/web/                 # Next.js App Router
supabase/migrations/      # Schema versionado (fonte da verdade do banco)
supabase/functions/       # Edge Functions (WhatsApp, IA, jobs) — a partir da Fase 4
packages/domain/          # Entidades e regras de negócio puras, compartilhadas
packages/database-types/  # Tipos gerados do banco (`pnpm db:types`)
packages/ui/              # Tokens de design institucional (paleta, dark mode)
packages/ai-providers/    # Camada agnóstica de LLM (Claude ⇄ OpenAI)
packages/config/          # eslint/tsconfig compartilhados
docs/architecture/        # ADRs e decisões de arquitetura
```

Cada módulo de negócio em `apps/web/src/features/<modulo>` segue sempre a mesma separação: `domain` (regras puras, sem I/O), `repository` (implementação Supabase), `services` (orquestração), `hooks` (TanStack Query), `components` (UI).

## Getting started

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # preencher com as chaves do projeto Supabase
pnpm dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `pnpm dev` | Sobe o app Next.js em modo desenvolvimento |
| `pnpm build` | Build de produção de todos os pacotes |
| `pnpm lint` | ESLint em todo o monorepo |
| `pnpm typecheck` | `tsc --noEmit` em todo o monorepo |
| `pnpm test` | Testes unitários (Vitest) |
| `pnpm db:types` | Regenera `packages/database-types` a partir do schema Supabase |

## Roadmap

Entrega faseada — fundação primeiro, depois um módulo por vez, cada um testável antes de avançar:

0. **Fundação** — monorepo, schema completo + RLS, auth/RBAC, design system, shell do dashboard *(concluída)*
1. Admin básico / RBAC funcional
2. CRM core (Kanban, notas, tags, anexos, tarefas)
3. Dashboard Executivo
4. IA Comercial + WhatsApp
5. Agenda (Google Calendar / Outlook / Calendly)
6. Distribuição Inteligente
7. Parceiros
8. Secretária (painel operacional)
9. Administração avançada, auditoria completa e LGPD

Decisões arquiteturais estão documentadas em [`docs/architecture`](docs/architecture).
