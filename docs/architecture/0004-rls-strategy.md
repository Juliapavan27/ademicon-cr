# ADR 0004 — Estratégia de RLS e funções auxiliares

## Status
Aceito.

## Contexto
A plataforma é multiusuário com 5 papéis (admin, gestor, consultor, secretaria, parceiro), cada um com visibilidade diferente sobre leads, conversas, agenda e comissões. Repetir a lógica de "papel do usuário atual" e "organização do usuário atual" em dezenas de policies é frágil e difícil de auditar.

## Decisão
Toda tabela com dado de organização/usuário tem RLS habilitado desde a Fase 0. A lógica de acesso é centralizada em 4 funções `SECURITY DEFINER` (`get_user_organization`, `user_has_role`, `is_admin`, `is_admin_or_gestor`), usadas por todas as policies. `SECURITY DEFINER` é necessário aqui para evitar recursão: uma versão `SECURITY INVOKER` dessas funções, ao consultar `profiles`/`user_roles` dentro de uma policy da própria tabela `profiles`, reavaliaria a mesma policy recursivamente.

Essas funções foram movidas para um schema `private` (não exposto pela API do PostgREST) via migration `00000000000010`, porque funções `SECURITY DEFINER` no schema `public` ficam automaticamente expostas como endpoints RPC (`/rest/v1/rpc/is_admin`), permitindo que qualquer usuário autenticado consultasse o papel de um `uid` arbitrário. Mover a função de schema não quebra as policies existentes: o Postgres resolve a referência por OID da função, não por nome qualificado, então nenhuma policy precisou ser recriada.

`service_role` (usado só em Edge Functions, nunca no client) contorna RLS para operações de sistema (IA, motor de distribuição) — toda ação relevante feita assim é registrada em `audit_logs`/`ai_decisions`/`distribution_decisions` com `actor_type` apropriado, mantendo rastreabilidade equivalente à de um usuário humano.

## Consequências
- Qualquer nova tabela/policy reaproveita as mesmas 4 funções, evitando lógica de acesso duplicada e divergente.
- `audit_logs` é append-only por design: não existe policy de `UPDATE`/`DELETE` para nenhum papel, incluindo admin.
- Validado via Supabase Advisors (`get_advisors`) — zero alertas de segurança após a migration 0010.
