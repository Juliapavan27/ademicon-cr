import { describe, expect, it } from "vitest";
import { parseLeadsCsv } from "./lead-import";

describe("parseLeadsCsv", () => {
  it("parses a comma-separated list with a recognized header", () => {
    const raw = "nome,telefone,empresa\nMaria Souza,11999990000,ACME\nJoão Silva,11988880000,";
    const rows = parseLeadsCsv(raw);
    expect(rows).toEqual([
      { fullName: "Maria Souza", phone: "11999990000", email: undefined, company: "ACME", note: undefined },
      { fullName: "João Silva", phone: "11988880000", email: undefined, company: undefined, note: undefined },
    ]);
  });

  it("parses tab-separated text pasted from a spreadsheet", () => {
    const raw = "nome\ttelefone\tobservação\nAna Lima\t11977770000\tquer consórcio de veículo";
    const rows = parseLeadsCsv(raw);
    expect(rows).toEqual([
      { fullName: "Ana Lima", phone: "11977770000", email: undefined, company: undefined, note: "quer consórcio de veículo" },
    ]);
  });

  it("falls back to the first column when there is no recognized header", () => {
    const raw = "Maria Souza\nJoão Silva";
    const rows = parseLeadsCsv(raw);
    expect(rows).toEqual([
      { fullName: "Maria Souza", phone: undefined, email: undefined, company: undefined, note: undefined },
      { fullName: "João Silva", phone: undefined, email: undefined, company: undefined, note: undefined },
    ]);
  });

  it("ignores blank lines and rows with an empty name", () => {
    const raw = "nome,telefone\nMaria Souza,11999990000\n\n,11900000000";
    const rows = parseLeadsCsv(raw);
    expect(rows).toEqual([{ fullName: "Maria Souza", phone: "11999990000", email: undefined, company: undefined, note: undefined }]);
  });

  it("returns an empty list for empty input", () => {
    expect(parseLeadsCsv("")).toEqual([]);
    expect(parseLeadsCsv("   \n  ")).toEqual([]);
  });
});
