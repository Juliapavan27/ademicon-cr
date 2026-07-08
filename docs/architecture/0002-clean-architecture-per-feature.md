# ADR 0002 — Clean Architecture por feature

## Status
Aceito.

## Contexto
A plataforma tem 8+ módulos de negócio com regras não triviais (score de lead, algoritmo de distribuição, orquestração de IA). Sem uma separação clara, regra de negócio tende a vazar para componentes React ou para chamadas diretas ao Supabase, dificultando teste e reuso.

## Decisão
Cada módulo em `apps/web/src/features/<modulo>` segue sempre 4 camadas:
- `domain/` — entidades, value objects e interfaces de repositório. TypeScript puro, sem Supabase/React/Next. Testável sem mocks pesados.
- `repository/` — implementação concreta (`SupabaseXRepository`) das interfaces do domain. Única camada que fala com o cliente Supabase.
- `services/` — orquestra domain + repository; contém regra de negócio dependente de I/O.
- `hooks/` — ponte para TanStack Query; chama `services`, nunca `repository` diretamente.

`app/` (App Router) só compõe componentes e hooks — nunca contém regra de negócio.

## Consequências
- Regras de negócio (ex.: `LeadScore`, `DistributionEngine`) são testáveis com testes unitários puros, sem subir banco.
- Trocar Supabase por outro backend no futuro afeta apenas a camada `repository/`.
- Um lint rule (`no-restricted-imports` em `packages/config/eslint.config.js`) impede que `domain/` importe de `repository/`, `app/` ou de `react`/`next`/`@supabase/*`, reforçando o limite no CI e não só por convenção.
