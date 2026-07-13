import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Validates which leads with a phone number and `whatsapp_status =
 * 'not_checked'` actually have an active WhatsApp account, via the
 * whatsapp-connector's /check-numbers (Baileys `onWhatsApp`). This only
 * works once the connector is deployed and connected — see ADR 0005 and the
 * project memory for the current connection status. Returns a clear error
 * instead of silently no-op'ing when the connector isn't configured.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const connectorUrl = process.env.WHATSAPP_CONNECTOR_URL;
  const connectorSecret = process.env.WHATSAPP_CONNECTOR_SECRET;
  if (!connectorUrl || !connectorSecret) {
    return NextResponse.json(
      { error: "Conector do WhatsApp não configurado (WHATSAPP_CONNECTOR_URL/SECRET ausentes)." },
      { status: 503 },
    );
  }

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select("id, phone")
    .eq("whatsapp_status", "not_checked")
    .not("phone", "is", null);
  if (leadsError) throw leadsError;
  if (!leads || leads.length === 0) {
    return NextResponse.json({ checked: 0, valid: 0, invalid: 0 });
  }

  const phones = leads.map((lead) => lead.phone!);
  const response = await fetch(`${connectorUrl}/check-numbers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-connector-secret": connectorSecret },
    body: JSON.stringify({ phones }),
  }).catch(() => null);

  if (!response || !response.ok) {
    const detail = response ? await response.json().catch(() => null) : null;
    return NextResponse.json(
      { error: detail?.error ?? "Não foi possível falar com o conector do WhatsApp." },
      { status: 502 },
    );
  }

  const { results } = (await response.json()) as { results: Record<string, boolean> };

  let valid = 0;
  let invalid = 0;
  for (const lead of leads) {
    const isValid = results[lead.phone!] ?? false;
    await supabase
      .from("leads")
      .update({ whatsapp_status: isValid ? "valid" : "invalid" })
      .eq("id", lead.id);
    if (isValid) valid++;
    else invalid++;
  }

  return NextResponse.json({ checked: leads.length, valid, invalid });
}
