export const conversationsKeys = {
  list: ["conversations", "list"] as const,
  messages: (conversationId: string) => ["conversations", conversationId, "messages"] as const,
  feedback: (aiDecisionIds: string[]) => ["conversations", "feedback", ...aiDecisionIds.sort()] as const,
};
