export const crmKeys = {
  stages: ["crm", "stages"] as const,
  leads: ["crm", "leads"] as const,
  lead: (leadId: string) => ["crm", "leads", leadId] as const,
  tags: ["crm", "tags"] as const,
  notes: (leadId: string) => ["crm", "leads", leadId, "notes"] as const,
  attachments: (leadId: string) => ["crm", "leads", leadId, "attachments"] as const,
  tasks: (leadId: string) => ["crm", "leads", leadId, "tasks"] as const,
  scoreHistory: (leadId: string) => ["crm", "leads", leadId, "score-history"] as const,
  deal: (leadId: string) => ["crm", "leads", leadId, "deal"] as const,
};
