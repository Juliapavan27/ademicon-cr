export interface ColdOutreachLead {
  fullName: string;
  company?: string | null;
}

const FIRST_NAME = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

/**
 * Composes a genuine cold-outreach opener: the lead has NOT expressed any
 * interest in consórcio and has never talked to Ademicon before. Unlike a
 * reactive reply (which can say "vi seu interesse"), this has to spark
 * curiosity about a product the person isn't looking for — never assume
 * prior interest or an existing conversation.
 */
export function composeColdOutreachMessage(lead: ColdOutreachLead): string {
  const name = FIRST_NAME(lead.fullName);
  const templates = lead.company
    ? [
        `Oi ${name}, tudo bem? Aqui é da Ademicon 👋 Estou entrando em contato porque, olhando pra quem tem a ${lead.company}, achei que valia a pena te contar: hoje dá pra comprar imóvel ou veículo sem pagar juros de banco, só uma taxa de administração — muita gente ainda não conhece essa opção. Topa que eu te explique em 2 minutos como funciona?`,
        `Oi ${name}! Aqui é da Ademicon. Sei que não conversamos antes, mas separei uma informação que pode fazer sentido pra ${lead.company}: existe uma forma de adquirir bens de maior valor sem entrar num financiamento tradicional. Posso te mandar um resumo rapidinho?`,
      ]
    : [
        `Oi ${name}, tudo bem? Aqui é da Ademicon 👋 Sei que não conversamos antes, mas quis te contar rapidinho sobre uma forma de comprar imóvel ou veículo sem pagar juros de banco — só uma taxa de administração. Muita gente nunca ouviu falar direito de como funciona. Posso te explicar em 2 minutos?`,
        `Oi ${name}! Aqui é da Ademicon. Vou direto ao ponto: hoje existe uma forma de adquirir um bem de maior valor sem entrar num financiamento tradicional, sem juros — chama consórcio, e funciona diferente do que a maioria imagina. Topa que eu te mande um resumo rápido?`,
      ];

  return pick(templates, lead.fullName);
}

/**
 * Softer cadence follow-ups for leads who haven't replied to the opener yet.
 * `stepNumber` 1 = first follow-up (~day 3), 2 = final nudge (~day 7).
 * These must stay low-pressure — a cold lead who's silent isn't ignoring a
 * request they made, so pushing hard here reads as spam.
 */
export function composeCadenceFollowUp(lead: ColdOutreachLead, stepNumber: number): string {
  const name = FIRST_NAME(lead.fullName);
  if (stepNumber >= 2) {
    const templates = [
      `Oi ${name}, essa é a última vez que te procuro por aqui — não quero incomodar 🙂 Se um dia fizer sentido saber mais sobre consórcio sem juros, é só me chamar. Um abraço da equipe Ademicon!`,
      `${name}, vou parar por aqui pra não ser chato(a) 😅 Fica o convite aberto: se quiser entender como funciona o consórcio da Ademicon, é só responder essa mensagem quando quiser.`,
    ];
    return pick(templates, lead.fullName + stepNumber);
  }

  const templates = [
    `Oi ${name}, tudo bem? Só retomando o contato — sei que a rotina é corrida. Se fizer sentido, posso te mandar um resumo de 1 minuto sobre como funciona o consórcio sem juros da Ademicon.`,
    `${name}, passando de novo por aqui 🙂 Sem compromisso: topa que eu te explique rapidinho uma forma de comprar sem financiamento tradicional?`,
  ];
  return pick(templates, lead.fullName + stepNumber);
}

/**
 * A short internal strategy note for the sales team — not sent to the
 * lead — suggesting what angle to lean on. Generated at import time from
 * whatever context the spreadsheet provided (company/segment), since that's
 * the only enrichment signal available without a live LLM call per lead.
 */
export function composeSuggestedApproach(lead: { fullName: string; company?: string; note?: string }): string {
  if (lead.note) {
    return `Usar como gancho: "${lead.note}". Focar em custo sem juros e flexibilidade de prazo.`;
  }
  if (lead.company) {
    return `Referenciar a empresa (${lead.company}) para dar contexto de que a abordagem foi pensada para o perfil dele, não é disparo genérico. Focar em economia frente a financiamento tradicional.`;
  }
  return `Pouca informação disponível sobre esse lead — abordagem genérica focada em despertar curiosidade sobre consórcio sem juros. Priorizar perguntas abertas na primeira resposta para enriquecer o perfil.`;
}

function pick<T>(options: T[], seed: string): T {
  return options[Math.abs(hashString(seed)) % options.length];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
