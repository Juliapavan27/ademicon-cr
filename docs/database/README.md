# Banco de dados

Fonte da verdade do schema: [`supabase/migrations`](../../supabase/migrations). Cada migration é nomeada por área:

| Migration | Conteúdo |
|---|---|
| `00000000000001_identity_rbac.sql` | organizations, profiles, roles, user_roles, permissions, role_permissions, cities, specialties, consultants |
| `00000000000002_rls_helper_functions.sql` | Funções auxiliares de RLS + policies das tabelas de identidade/RBAC |
| `00000000000003_crm.sql` | pipeline_stages, leads, deals, lead_score_history, tags, notes, attachments, tasks |
| `00000000000004_ai_conversations.sql` | conversations, messages, ai_decisions, ai_learning_feedback, ai_prompt_templates, conversation_summaries |
| `00000000000005_scheduling.sql` | calendar_integrations, appointments, appointment_reminders |
| `00000000000006_distribution.sql` | consultant_queue, distribution_rules, distribution_decisions |
| `00000000000007_partners.sql` | partners, referrals, commissions, partner_rankings |
| `00000000000008_audit_lgpd.sql` | audit_logs (append-only), lgpd_consents, lgpd_data_requests |
| `00000000000009_seed_reference_data.sql` | Organização Ademicon, catálogo de papéis/permissões, funil padrão |
| `00000000000010_move_rls_helpers_to_private_schema.sql` | Move as funções de RLS para o schema `private` (ver [ADR 0004](../architecture/0004-rls-strategy.md)) |

## Convenções

- Toda tabela com dado de organização tem uma coluna `organization_id` e RLS habilitado.
- Chaves primárias são `uuid` (`gen_random_uuid()`), exceto `consultants` (PK = `user_id`, FK para `profiles`).
- Tabelas de auditoria (`audit_logs`) e LGPD são append-only: nenhuma policy de `UPDATE`/`DELETE` existe para elas.
- Regenerar os tipos TypeScript após qualquer migration: `pnpm db:types`.
