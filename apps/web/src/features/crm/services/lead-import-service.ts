import { ProviderFactory, type ChatMessage } from "@ademicon/ai-providers";
import type { CrmRepository } from "../domain/crm-repository";
import type { ParsedLeadRow } from "../domain/lead-import";

export interface ImportedLeadResult {
  fullName: string;
  score: number;
  motivo: string;
}

/**
 * Imports a parsed lead list and runs each row through the same agnostic AI
 * layer used for WhatsApp conversations (`@ademicon/ai-providers`) to derive
 * a qualification score — same engine, different trigger (a fresh import
 * instead of an inbound message). Falls back to `MockProvider` with no keys
 * configured, so this is fully demoable without any external API call.
 */
export class LeadImportService {
  constructor(private readonly repository: CrmRepository) {}

  async importAndQualify(rows: ParsedLeadRow[]): Promise<ImportedLeadResult[]> {
    const provider = ProviderFactory.resolve({});
    const results: ImportedLeadResult[] = [];

    for (const row of rows) {
      const lead = await this.repository.createLead({
        fullName: row.fullName,
        phone: row.phone,
        email: row.email,
        source: "import",
      });

      // No fixed boilerplate here on purpose: the mock provider scores by
      // message length as an engagement/information-richness proxy, so a
      // lead with only a name should score lower than one with a company
      // and a clear stated interest — a fixed prefix would swamp that signal.
      const signal = [row.fullName, row.company, row.note].filter(Boolean).join(". ");
      const messages: ChatMessage[] = [{ role: "user", content: signal }];

      let score = 0;
      let motivo = "Classificação automática.";
      await provider.generateResponse({
        messages,
        handlers: {
          classify_lead: async (args) => {
            const parsed = args as { score: number; motivo: string };
            score = parsed.score;
            motivo = parsed.motivo;
            return null;
          },
        },
      });

      await this.repository.adjustLeadScore(lead.id, lead.leadScore, score - lead.leadScore, motivo);
      results.push({ fullName: row.fullName, score, motivo });
    }

    return results;
  }
}
