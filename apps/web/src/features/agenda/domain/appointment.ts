export type AppointmentStatus = "scheduled" | "confirmed" | "rescheduled" | "completed" | "no_show" | "cancelled";
export type AppointmentSource = "ai_scheduled" | "manual" | "consultant_calendar";

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  consultantId: string;
  consultantName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  source: AppointmentSource;
}
