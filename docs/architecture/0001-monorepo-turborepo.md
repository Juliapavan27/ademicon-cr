# ADR 0001 — Monorepo com Turborepo + pnpm

## Status
Aceito.

## Contexto
A plataforma precisa, além do app Next.js, de Supabase Edge Functions (runtime Deno) para o webhook do WhatsApp, o worker de IA e jobs de distribuição/agenda. Essas funções e o app web compartilham tipos de banco, schemas de validação e regras de domínio puras (ex.: o algoritmo de distribuição inteligente).

## Decisão
Adotar um monorepo (`apps/`, `packages/`, `supabase/`) orquestrado por Turborepo, com pnpm workspaces para instalação e linkagem de pacotes internos.

## Consequências
- `packages/domain`, `packages/database-types` e `packages/ai-providers` podem ser importados tanto pelo app Next.js quanto pelas Edge Functions sem duplicação de código.
- Turborepo cacheia build/lint/test por pacote, mantendo o CI rápido mesmo com o crescimento do número de módulos.
- Custo aceito: setup inicial mais pesado do que um único app Next.js — pago uma vez, evita retrabalho de migração quando a Fase 4 (IA/WhatsApp) introduzir as Edge Functions.
