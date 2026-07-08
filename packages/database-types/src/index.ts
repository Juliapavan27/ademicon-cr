// Generated via `pnpm db:types` (supabase gen types typescript). Do not hand-edit.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_decisions: {
        Row: {
          confidence_score: number | null
          conversation_id: string
          created_at: string
          decision_type: string
          id: string
          input_context: Json
          llm_model: string | null
          llm_provider: string | null
          message_id: string | null
          output_payload: Json
        }
        Insert: {
          confidence_score?: number | null
          conversation_id: string
          created_at?: string
          decision_type: string
          id?: string
          input_context?: Json
          llm_model?: string | null
          llm_provider?: string | null
          message_id?: string | null
          output_payload?: Json
        }
        Update: {
          confidence_score?: number | null
          conversation_id?: string
          created_at?: string
          decision_type?: string
          id?: string
          input_context?: Json
          llm_model?: string | null
          llm_provider?: string | null
          message_id?: string | null
          output_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_decisions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_learning_feedback: {
        Row: {
          ai_decision_id: string
          corrected_by: string | null
          correction_payload: Json | null
          created_at: string
          feedback_type: string
          id: string
        }
        Insert: {
          ai_decision_id: string
          corrected_by?: string | null
          correction_payload?: Json | null
          created_at?: string
          feedback_type: string
          id?: string
        }
        Update: {
          ai_decision_id?: string
          corrected_by?: string | null
          correction_payload?: Json | null
          created_at?: string
          feedback_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_learning_feedback_ai_decision_id_fkey"
            columns: ["ai_decision_id"]
            isOneToOne: false
            referencedRelation: "ai_decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_learning_feedback_corrected_by_fkey"
            columns: ["corrected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompt_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          segment: string
          template_content: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          segment: string
          template_content: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          segment?: string
          template_content?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_reminders: {
        Row: {
          appointment_id: string
          channel: string
          id: string
          scheduled_for: string
          sent_at: string | null
          status: string
        }
        Insert: {
          appointment_id: string
          channel: string
          id?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          appointment_id?: string
          channel?: string
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_reminders_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          consultant_id: string
          created_at: string
          duration_minutes: number
          external_event_id: string | null
          id: string
          lead_id: string
          meeting_link: string | null
          scheduled_at: string
          source: string
          status: string
        }
        Insert: {
          consultant_id: string
          created_at?: string
          duration_minutes?: number
          external_event_id?: string | null
          id?: string
          lead_id: string
          meeting_link?: string | null
          scheduled_at: string
          source?: string
          status?: string
        }
        Update: {
          consultant_id?: string
          created_at?: string
          duration_minutes?: number
          external_event_id?: string | null
          id?: string
          lead_id?: string
          meeting_link?: string | null
          scheduled_at?: string
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          lead_id: string | null
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          lead_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          lead_id?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          organization_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          organization_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          organization_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string | null
          connected_at: string
          consultant_id: string
          external_account_id: string | null
          id: string
          provider: string
          refresh_token: string | null
          status: string
        }
        Insert: {
          access_token?: string | null
          connected_at?: string
          consultant_id: string
          external_account_id?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          status?: string
        }
        Update: {
          access_token?: string | null
          connected_at?: string
          consultant_id?: string
          external_account_id?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cities: {
        Row: {
          id: string
          name: string
          region: string | null
          state: string
        }
        Insert: {
          id?: string
          name: string
          region?: string | null
          state: string
        }
        Update: {
          id?: string
          name?: string
          region?: string | null
          state?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          created_at: string
          deal_id: string
          id: string
          paid_at: string | null
          partner_id: string
          percentual: number | null
          status: string
          valor: number
        }
        Insert: {
          created_at?: string
          deal_id: string
          id?: string
          paid_at?: string | null
          partner_id: string
          percentual?: number | null
          status?: string
          valor: number
        }
        Update: {
          created_at?: string
          deal_id?: string
          id?: string
          paid_at?: string | null
          partner_id?: string
          percentual?: number | null
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "commissions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_queue: {
        Row: {
          consultant_id: string
          entered_queue_at: string
          id: string
          is_available: boolean
          last_meeting_completed_at: string | null
          organization_id: string
          position_in_queue: number
        }
        Insert: {
          consultant_id: string
          entered_queue_at?: string
          id?: string
          is_available?: boolean
          last_meeting_completed_at?: string | null
          organization_id: string
          position_in_queue: number
        }
        Update: {
          consultant_id?: string
          entered_queue_at?: string
          id?: string
          is_available?: boolean
          last_meeting_completed_at?: string | null
          organization_id?: string
          position_in_queue?: number
        }
        Relationships: [
          {
            foreignKeyName: "consultant_queue_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: true
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "consultant_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_specialties: {
        Row: {
          consultant_id: string
          specialty_id: string
        }
        Insert: {
          consultant_id: string
          specialty_id: string
        }
        Update: {
          consultant_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_specialties_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "consultant_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          city_id: string | null
          created_at: string
          max_carga_diaria: number
          organization_id: string
          performance_score: number
          status: string
          user_id: string
        }
        Insert: {
          city_id?: string | null
          created_at?: string
          max_carga_diaria?: number
          organization_id: string
          performance_score?: number
          status?: string
          user_id: string
        }
        Update: {
          city_id?: string | null
          created_at?: string
          max_carga_diaria?: number
          organization_id?: string
          performance_score?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultants_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultants_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          conversation_id: string
          generated_at: string
          generated_by_model: string | null
          id: string
          summary_text: string
        }
        Insert: {
          conversation_id: string
          generated_at?: string
          generated_by_model?: string | null
          id?: string
          summary_text: string
        }
        Update: {
          conversation_id?: string
          generated_at?: string
          generated_by_model?: string | null
          id?: string
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_consultant_id: string | null
          channel: string
          created_at: string
          external_thread_id: string | null
          id: string
          last_message_at: string | null
          lead_id: string
          status: string
        }
        Insert: {
          assigned_consultant_id?: string | null
          channel?: string
          created_at?: string
          external_thread_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id: string
          status?: string
        }
        Update: {
          assigned_consultant_id?: string | null
          channel?: string
          created_at?: string
          external_thread_id?: string | null
          id?: string
          last_message_at?: string | null
          lead_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          lost_at: string | null
          lost_reason: string | null
          organization_id: string
          probabilidade: number | null
          produto: string | null
          stage_id: string | null
          valor_estimado: number | null
          won_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          lost_at?: string | null
          lost_reason?: string | null
          organization_id: string
          probabilidade?: number | null
          produto?: string | null
          stage_id?: string | null
          valor_estimado?: number | null
          won_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          lost_at?: string | null
          lost_reason?: string | null
          organization_id?: string
          probabilidade?: number | null
          produto?: string | null
          stage_id?: string | null
          valor_estimado?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_decisions: {
        Row: {
          candidatos_avaliados: Json
          consultant_id_chosen: string | null
          decided_at: string
          id: string
          lead_id: string
          regra_aplicada_id: string | null
        }
        Insert: {
          candidatos_avaliados?: Json
          consultant_id_chosen?: string | null
          decided_at?: string
          id?: string
          lead_id: string
          regra_aplicada_id?: string | null
        }
        Update: {
          candidatos_avaliados?: Json
          consultant_id_chosen?: string | null
          decided_at?: string
          id?: string
          lead_id?: string
          regra_aplicada_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distribution_decisions_consultant_id_chosen_fkey"
            columns: ["consultant_id_chosen"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "distribution_decisions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distribution_decisions_regra_aplicada_id_fkey"
            columns: ["regra_aplicada_id"]
            isOneToOne: false
            referencedRelation: "distribution_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      distribution_rules: {
        Row: {
          created_at: string
          criteria_weights: Json
          id: string
          is_active: boolean
          organization_id: string
          version: number
        }
        Insert: {
          created_at?: string
          criteria_weights?: Json
          id?: string
          is_active?: boolean
          organization_id: string
          version?: number
        }
        Update: {
          created_at?: string
          criteria_weights?: Json
          id?: string
          is_active?: boolean
          organization_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "distribution_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_score_history: {
        Row: {
          created_at: string
          gerado_por: string
          id: string
          lead_id: string
          motivo: string
          score_anterior: number
          score_novo: number
        }
        Insert: {
          created_at?: string
          gerado_por?: string
          id?: string
          lead_id: string
          motivo: string
          score_anterior: number
          score_novo: number
        }
        Update: {
          created_at?: string
          gerado_por?: string
          id?: string
          lead_id?: string
          motivo?: string
          score_anterior?: number
          score_novo?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_tags: {
        Row: {
          lead_id: string
          tag_id: string
        }
        Insert: {
          lead_id: string
          tag_id: string
        }
        Update: {
          lead_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tags_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_consultant_id: string | null
          city_id: string | null
          consent_given_at: string | null
          consent_source: string | null
          created_at: string
          current_stage_id: string | null
          email: string | null
          full_name: string
          id: string
          lead_score: number
          organization_id: string
          phone: string | null
          source: string
          specialty_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_consultant_id?: string | null
          city_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string
          current_stage_id?: string | null
          email?: string | null
          full_name: string
          id?: string
          lead_score?: number
          organization_id: string
          phone?: string | null
          source?: string
          specialty_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_consultant_id?: string | null
          city_id?: string | null
          consent_given_at?: string | null
          consent_source?: string | null
          created_at?: string
          current_stage_id?: string | null
          email?: string | null
          full_name?: string
          id?: string
          lead_score?: number
          organization_id?: string
          phone?: string | null
          source?: string
          specialty_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_consultant_id_fkey"
            columns: ["assigned_consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_consents: {
        Row: {
          consent_type: string
          granted_at: string | null
          id: string
          ip_address: string | null
          lead_id: string
          revoked_at: string | null
          source: string | null
        }
        Insert: {
          consent_type: string
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          lead_id: string
          revoked_at?: string | null
          source?: string | null
        }
        Update: {
          consent_type?: string
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          lead_id?: string
          revoked_at?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_consents_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lgpd_data_requests: {
        Row: {
          fulfilled_at: string | null
          fulfilled_by: string | null
          id: string
          lead_id: string
          request_type: string
          requested_at: string
          status: string
        }
        Insert: {
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          lead_id: string
          request_type: string
          requested_at?: string
          status?: string
        }
        Update: {
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          id?: string
          lead_id?: string
          request_type?: string
          requested_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lgpd_data_requests_fulfilled_by_fkey"
            columns: ["fulfilled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lgpd_data_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          content_type: string
          conversation_id: string
          created_at: string
          direction: string
          external_message_id: string | null
          id: string
          metadata: Json
          sender_type: string
        }
        Insert: {
          content: string
          content_type?: string
          conversation_id: string
          created_at?: string
          direction: string
          external_message_id?: string | null
          id?: string
          metadata?: Json
          sender_type: string
        }
        Update: {
          content?: string
          content_type?: string
          conversation_id?: string
          created_at?: string
          direction?: string
          external_message_id?: string | null
          id?: string
          metadata?: Json
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          is_ai_generated: boolean
          lead_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          lead_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          settings: Json
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          settings?: Json
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          settings?: Json
          slug?: string
        }
        Relationships: []
      }
      partner_rankings: {
        Row: {
          calculated_at: string
          id: string
          partner_id: string
          periodo: string
          rank_position: number | null
          total_comissao: number
          total_convertidas: number
          total_indicacoes: number
        }
        Insert: {
          calculated_at?: string
          id?: string
          partner_id: string
          periodo: string
          rank_position?: number | null
          total_comissao?: number
          total_convertidas?: number
          total_indicacoes?: number
        }
        Update: {
          calculated_at?: string
          id?: string
          partner_id?: string
          periodo?: string
          rank_position?: number | null
          total_comissao?: number
          total_convertidas?: number
          total_indicacoes?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_rankings_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          bank_info: Json | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          organization_id: string
          phone: string | null
          status: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          bank_info?: Json | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          organization_id: string
          phone?: string | null
          status?: string
          tipo?: string
          user_id?: string | null
        }
        Update: {
          bank_info?: Json | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          organization_id?: string
          phone?: string | null
          status?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partners_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          description: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          description?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          description?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_lost: boolean
          is_won: boolean
          name: string
          order_index: number
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          name: string
          order_index: number
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_lost?: boolean
          is_won?: boolean
          name?: string
          order_index?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization_id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          organization_id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          partner_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          partner_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          partner_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          name: string
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          organization_id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
