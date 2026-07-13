import { composeCadenceFollowUp, composeColdOutreachMessage } from "@/features/conversations/domain/cold-outreach";
import type { CadenceRepository } from "../domain/cadence-repository";

const STEP_OFFSET_DAYS = [0, 3, 7];

export class CadenceService {
  constructor(private readonly repository: CadenceRepository) {}

  /**
   * Seeds the standard 3-touch cadence (day 0 opener, day 3 and day 7
   * follow-ups) for a freshly imported lead. The scheduled Edge Function
   * dispatcher sends each step when it's due, and cancels the rest as soon
   * as the lead replies — see supabase/functions/cadence-dispatcher.
   */
  async seedCadenceForLead(lead: { id: string; fullName: string; company: string | null }): Promise<void> {
    const now = Date.now();
    const steps = STEP_OFFSET_DAYS.map((offsetDays, index) => ({
      stepNumber: index,
      messageText:
        index === 0
          ? composeColdOutreachMessage(lead)
          : composeCadenceFollowUp(lead, index),
      scheduledAt: new Date(now + offsetDays * 24 * 60 * 60 * 1000).toISOString(),
    }));
    await this.repository.createSteps(lead.id, steps);
  }
}
