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

  const index = Math.abs(hashString(lead.fullName)) % templates.length;
  return templates[index];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
