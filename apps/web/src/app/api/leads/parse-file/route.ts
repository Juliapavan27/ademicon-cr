import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/shared/lib/supabase/server";
import { mapRowsToLeads } from "@/features/crm/domain/lead-import";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.load(buffer);
  } catch {
    return NextResponse.json(
      { error: "Não foi possível ler o arquivo — confirme que é um .xlsx válido." },
      { status: 400 },
    );
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return NextResponse.json({ error: "A planilha não tem nenhuma aba com dados." }, { status: 400 });
  }

  const rows: string[][] = [];
  worksheet.eachRow((row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      cells.push(cell.text ?? "");
    });
    rows.push(cells);
  });

  const parsed = mapRowsToLeads(rows);
  return NextResponse.json({ rows: parsed });
}
