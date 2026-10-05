import { professionals } from "@/data/site-data";
export type Appointment = { id: string; name: string; whatsapp: string; professional: string; date: string; time: string; modality: string; consent: boolean; website?: string };
export function todayInBrazil() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function validDate(date: string) {
  return typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date + "T12:00:00Z")) && new Date(date + "T12:00:00Z").toISOString().slice(0, 10) === date && date >= todayInBrazil();
}
export function validSelection(professional: string, date: string, modality: string) {
  return professionals.some(p => p.name === professional) && validDate(date) && ["presencial", "online"].includes(modality);
}
export type AppointmentIssue = { message: string; code: string; field?: keyof Appointment };
export function appointmentIssue(value: unknown, requireId = true): AppointmentIssue | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { message: "Não foi possível ler os dados da solicitação. Atualize a página e tente novamente.", code: "invalid_data" };
  const data = value as Record<string, unknown>;
  if (typeof data.name !== "string" || data.name.trim().length < 2 || data.name.length > 100) return { message: "Informe seu nome, com pelo menos dois caracteres e no máximo 100.", code: "invalid_name", field: "name" };
  if (typeof data.whatsapp !== "string" || !/^\d{10,13}$/.test(data.whatsapp.replace(/\D/g, ""))) return { message: "Informe um WhatsApp válido, incluindo o DDD.", code: "invalid_whatsapp", field: "whatsapp" };
  if (typeof data.professional !== "string" || !professionals.some(p => p.name === data.professional)) return { message: "Selecione uma das profissionais disponíveis.", code: "invalid_professional", field: "professional" };
  if (typeof data.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date + "T12:00:00Z")) || new Date(data.date + "T12:00:00Z").toISOString().slice(0, 10) !== data.date) return { message: "Escolha uma data válida no calendário, incluindo o ano.", code: "invalid_date", field: "date" };
  const today = todayInBrazil();
  if (data.date < today) return { message: `Escolha uma data a partir de ${today.split("-").reverse().join("/")}.`, code: "date_in_past", field: "date" };
  if (typeof data.modality !== "string" || !["presencial", "online"].includes(data.modality)) return { message: "Escolha atendimento presencial ou online.", code: "invalid_modality", field: "modality" };
  if (typeof data.time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) return { message: "Selecione um dos horários disponíveis.", code: "invalid_time", field: "time" };
  if (data.consent !== true) return { message: "Marque a autorização para que a clínica possa responder à sua solicitação.", code: "missing_consent", field: "consent" };
  if (data.website) return { message: "Não foi possível enviar sua solicitação. Atualize a página e tente novamente.", code: "invalid_submission" };
  if (requireId && (typeof data.id !== "string" || !/^[a-f0-9-]{36}$/i.test(data.id))) return { message: "Não foi possível identificar sua solicitação. Atualize a página e tente novamente.", code: "invalid_request_id" };
  return null;
}
export function validAppointment(data: unknown): data is Appointment {
  return appointmentIssue(data) === null;
}
