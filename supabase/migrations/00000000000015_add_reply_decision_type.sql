-- ai_learning_feedback requires an ai_decisions row to attach to (thumbs
-- up/down/correction on a specific AI action). But the original decision_type
-- check constraint only covered tool-triggered actions (classify_lead,
-- create_task, update_stage, summarize, handoff_human) — a plain-text WhatsApp
-- reply with no tool call had no decision row to give feedback on. Adding
-- 'reply' so every AI-generated outbound message gets a logged decision,
-- making it feedback-able regardless of whether a tool fired alongside it.

alter table ai_decisions drop constraint ai_decisions_decision_type_check;
alter table ai_decisions add constraint ai_decisions_decision_type_check
  check (decision_type in ('classify_lead', 'create_task', 'update_stage', 'schedule_meeting', 'summarize', 'handoff_human', 'reply'));
