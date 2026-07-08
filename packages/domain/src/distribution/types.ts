export interface ConsultantCandidate {
  consultantId: string;
  specialtyIds: string[];
  cityId: string | null;
  isAvailable: boolean;
  currentLoad: number;
  maxDailyLoad: number;
  performanceScore: number;
  queueEnteredAt: string;
}

export interface DistributionCriteriaWeights {
  arrivalOrder: number;
  specialtyMatch: number;
  cityMatch: number;
  performance: number;
  currentLoad: number;
}

export interface DistributionCriteria {
  leadSpecialtyId: string;
  leadCityId: string | null;
  weights: DistributionCriteriaWeights;
}

export interface DistributionCandidateScore {
  consultantId: string;
  score: number;
  breakdown: Record<keyof DistributionCriteriaWeights, number>;
}

export interface DistributionResult {
  chosenConsultantId: string | null;
  evaluatedCandidates: DistributionCandidateScore[];
}

/**
 * Full scoring algorithm ships in Fase 6 (Distribuição Inteligente).
 * Signature is fixed now so Agenda/Consultores integrations in earlier
 * fases can depend on a stable contract.
 */
export interface DistributionEngine {
  selectBestConsultant(
    candidates: ConsultantCandidate[],
    criteria: DistributionCriteria,
  ): DistributionResult;
}
