"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSubmitFeedback } from "../hooks/use-conversation-messages";
import type { AiFeedback } from "../domain/conversation";

export function MessageFeedback({
  conversationId,
  aiDecisionId,
  feedback,
}: {
  conversationId: string;
  aiDecisionId: string;
  feedback: AiFeedback | undefined;
}) {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionText, setCorrectionText] = useState("");
  const mutation = useSubmitFeedback(conversationId);

  if (feedback) {
    return (
      <p className="text-xs text-muted-foreground">
        {feedback.feedbackType === "thumbs_up" && "Marcado como boa resposta"}
        {feedback.feedbackType === "thumbs_down" && "Marcado como resposta ruim"}
        {feedback.feedbackType === "correction" && "Correção enviada"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ aiDecisionId, feedbackType: "thumbs_up" })}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate({ aiDecisionId, feedbackType: "thumbs_down" })}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6", isCorrecting && "bg-muted")}
          onClick={() => setIsCorrecting((value) => !value)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
      {isCorrecting && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={correctionText}
            onChange={(event) => setCorrectionText(event.target.value)}
            placeholder="Como a IA deveria ter respondido?"
            className="min-h-16 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate(
                  { aiDecisionId, feedbackType: "correction", correctionText },
                  {
                    onSuccess: () => {
                      setIsCorrecting(false);
                      setCorrectionText("");
                    },
                  },
                )
              }
            >
              Enviar correção
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsCorrecting(false)}>
              Cancelar
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-xs text-destructive">{(mutation.error as Error).message}</p>
          )}
        </div>
      )}
    </div>
  );
}
