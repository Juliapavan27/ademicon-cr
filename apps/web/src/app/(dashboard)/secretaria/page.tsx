import { DistributionBoard } from "@/features/agenda/components/distribution-board";

export default function SecretariaPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Secretária</h1>
        <p className="text-sm text-muted-foreground">
          Processamento da cadência de prospecção e distribuição manual de agendamentos entre consultores.
        </p>
      </div>
      <DistributionBoard />
    </div>
  );
}
