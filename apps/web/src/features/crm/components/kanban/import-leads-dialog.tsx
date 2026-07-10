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
import { parseLeadsCsv } from "../../domain/lead-import";
import { useImportLeads } from "../../hooks/use-import-leads";

const PLACEHOLDER = `nome,telefone,empresa,observação
Marina Alves,11 98888-0000,Alves Contabilidade,pediu simulação de imóvel de 350 mil
Rodrigo Nunes,11 97777-0000,,cliente indicado pelo Carlos`;

export function ImportLeadsDialog() {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const importLeads = useImportLeads();

  const preview = useMemo(() => parseLeadsCsv(raw), [raw]);

  async function handleFile(file: File) {
    const text = await file.text();
    setRaw(text);
  }

  async function handleImport() {
    try {
      const result = await importLeads.mutateAsync(preview);
      toast.success(`${result.imported} leads importados e qualificados pela IA.`);
      setRaw("");
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
            Cole a lista copiada de uma planilha (Excel/Google Sheets) ou envie um arquivo .csv. A IA
            qualifica cada lead automaticamente assim que a importação for confirmada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
            className="text-sm"
          />
          <Textarea
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            placeholder={PLACEHOLDER}
            className="min-h-32 font-mono text-xs"
          />

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
          <Button onClick={handleImport} disabled={preview.length === 0 || importLeads.isPending}>
            {importLeads.isPending
              ? `Qualificando ${preview.length} leads...`
              : `Importar e qualificar ${preview.length || ""} leads`.trim()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
