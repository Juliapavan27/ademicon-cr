"use client";

import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCheckWhatsApp } from "../../hooks/use-check-whatsapp";

export function CheckWhatsAppButton() {
  const checkWhatsApp = useCheckWhatsApp();

  async function handleClick() {
    try {
      const result = await checkWhatsApp.mutateAsync();
      if (result.checked === 0) {
        toast.info("Nenhum lead pendente de verificação.");
        return;
      }
      toast.success(`${result.valid} números válidos, ${result.invalid} inválidos de ${result.checked} verificados.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao verificar WhatsApp.");
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={checkWhatsApp.isPending}>
      <ShieldCheck className="size-4" />
      {checkWhatsApp.isPending ? "Verificando..." : "Verificar WhatsApp"}
    </Button>
  );
}
