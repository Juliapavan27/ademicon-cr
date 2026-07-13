import type { CadenceStep, NewCadenceStep } from "./cadence";

export interface CadenceRepository {
  createSteps(leadId: string, steps: NewCadenceStep[]): Promise<void>;
  listStepsForLead(leadId: string): Promise<CadenceStep[]>;
}
