import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseCrmRepository } from "@/features/crm/repository/supabase-crm-repository";
import { LeadImportService } from "@/features/crm/services/lead-import-service";

const rowSchema = z.object({
  fullName: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  company: z.string().optional(),
  note: z.string().optional(),
});

const bodySchema = z.object({ rows: z.array(rowSchema).min(1).max(200) });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const service = new LeadImportService(new SupabaseCrmRepository(supabase));
  const results = await service.importAndQualify(parsed.data.rows);

  return NextResponse.json({ imported: results.length, results });
}
