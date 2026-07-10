export interface ParsedLeadRow {
  fullName: string;
  phone?: string;
  email?: string;
  company?: string;
  note?: string;
}

const HEADER_ALIASES: Record<keyof Omit<ParsedLeadRow, "fullName">, string[]> = {
  phone: ["telefone", "phone", "celular", "whatsapp", "fone"],
  email: ["email", "e-mail"],
  company: ["empresa", "company", "negocio", "negócio"],
  note: ["observacao", "observação", "interesse", "nota", "note", "comentario", "comentário"],
};

const NAME_ALIASES = ["nome", "name", "lead", "cliente"];

function detectDelimiter(headerLine: string): string {
  return headerLine.includes("\t") ? "\t" : ",";
}

function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ""));
}

/**
 * Parses a pasted or uploaded lead list (CSV or tab-separated, as copied
 * directly from a spreadsheet). Header row is required; column order is
 * flexible and matched case-insensitively against common Portuguese/English
 * aliases. Falls back to the first column as the name when no header alias
 * matches, so a headerless single-column list of names still imports.
 */
export function parseLeadsCsv(raw: string): ParsedLeadRow[] {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());

  const nameIndex = headers.findIndex((h) => NAME_ALIASES.includes(h));
  const columnIndex = {
    phone: headers.findIndex((h) => HEADER_ALIASES.phone.includes(h)),
    email: headers.findIndex((h) => HEADER_ALIASES.email.includes(h)),
    company: headers.findIndex((h) => HEADER_ALIASES.company.includes(h)),
    note: headers.findIndex((h) => HEADER_ALIASES.note.includes(h)),
  };

  const hasRecognizedHeader = nameIndex >= 0 || Object.values(columnIndex).some((i) => i >= 0);
  const dataLines = hasRecognizedHeader ? lines.slice(1) : lines;

  return dataLines
    .map((line) => splitLine(line, delimiter))
    .map((cols) => ({
      fullName: (nameIndex >= 0 ? cols[nameIndex] : cols[0]) ?? "",
      phone: columnIndex.phone >= 0 ? cols[columnIndex.phone] || undefined : undefined,
      email: columnIndex.email >= 0 ? cols[columnIndex.email] || undefined : undefined,
      company: columnIndex.company >= 0 ? cols[columnIndex.company] || undefined : undefined,
      note: columnIndex.note >= 0 ? cols[columnIndex.note] || undefined : undefined,
    }))
    .filter((row) => row.fullName.length > 0);
}
