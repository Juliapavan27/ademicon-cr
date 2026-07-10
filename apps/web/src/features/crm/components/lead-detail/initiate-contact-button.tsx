"use client";

import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useInitiateOutboundContact } from "@/features/conversations/hooks/use-outbound";

export function InitiateContactButton({ leadId }: { leadId: string }) {
  const initiate = useInitiateOutboundContact();
  const router = useRouter();

  async function handleClick() {
    try {
      await initiate.mutateAsync(leadId);
      toast.success("IA iniciou contato com o lead (simulado). Veja em Conversas.");
      router.push("/conversas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao iniciar contato.");
    }
  }

  return (
    <Button size="sm" variant="secondary" onClick={handleClick} disabled={initiate.isPending}>
      <MessageCircle className="size-4" />
      {initiate.isPending ? "Iniciando contato..." : "Iniciar contato via IA"}
    </Button>
  );
}
