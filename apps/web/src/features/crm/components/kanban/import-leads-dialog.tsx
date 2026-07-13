"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { parseLeadsCsv, type ParsedLeadRow } from "../../domain/lead-import";
import { useImportLeads } from "../../hooks/use-import-leads";

const PLACEHOLDER = `nome,telefone,empresa,observação
Marina Alves,11 98888-0000,Alves Contabilidade,dona de contabilidade - contato frio
Rodrigo Nunes,11 97777-0000,,contato frio sem histórico prévio`;

export function ImportLeadsDialog() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [fileRows, setFileRows] = useState<ParsedLeadRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const importLeads = useImportLeads();

  const textPreview = useMemo(() => parseLeadsCsv(raw), [raw]);
  const preview = fileRows ?? textPreview;

  async function handleFile(file: File) {
    setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      setIsParsingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/leads/parse-file", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Falha ao ler a planilha.");
        setFileRows(data.rows);
        setRaw("");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao ler a planilha.");
        setFileRows(null);
      } finally {
        setIsParsingFile(false);
      }
    } else {
      const text = await file.text();
      setFileRows(null);
      setRaw(text);
    }
  }

  function resetForm() {
    setRaw("");
    setFileRows(null);
    setFileName(null);
  }

  async function handleImport() {
    try {
      const result = await importLeads.mutateAsync(preview);
      toast.success(`${result.imported} leads importados e qualificados pela IA.`);
      resetForm();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao importar leads.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="size-4" />
          Importar leads
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar lista de leads</DialogTitle>
          <DialogDescription>
            Para contatos frios — pessoas que ainda não conhecem a Ademicon. Envie uma planilha .xlsx, um
            arquivo .csv, ou cole a lista copiada do Excel/Google Sheets abaixo. A IA qualifica e sugere uma
            abordagem para cada lead assim que a importação for confirmada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".xlsx,.csv,.tsv,.txt"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className="text-sm"
          />
          {fileRows ? (
            <p className="text-xs text-muted-foreground">
              {fileName} — {fileRows.length} linhas lidas.{" "}
              <button type="button" className="underline" onClick={resetForm}>
                Limpar e colar texto
              </button>
            </p>
          ) : (
            <Textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              placeholder={PLACEHOLDER}
              className="min-h-32 font-mono text-xs"
            />
          )}

          {isParsingFile && <p className="text-sm text-muted-foreground">Lendo planilha...</p>}

          {preview.length > 0 && (
            <div className="max-h-64 overflow-y-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Empresa</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">{row.phone ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{row.company ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={preview.length === 0 || importLeads.isPending || isParsingFile}>
            {importLeads.isPending
              ? `Qualificando ${preview.length} leads...`
              : `Importar e qualificar ${preview.length || ""} leads`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
