import { professionals } from "@/data/site-data";
export type Appointment = { id: string; name: string; whatsapp: string; professional: string; date: string; time: string; modality: string; consent: boolean; website?: string };
export function todayInBrazil() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
export function validDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date + "T12:00:00Z")) && new Date(date + "T12:00:00Z").toISOString().slice(0, 10) === date && date >= todayInBrazil();
}
export function validSelection(professional: string, date: string, modality: string) {
  return professionals.some(p => p.name === professional) && validDate(date) && ["presencial", "online"].includes(modality);
}
export function validAppointment(data: Appointment) {
  return data && typeof data.name === "string" && data.name.trim().length >= 2 && data.name.length <= 100 && typeof data.whatsapp === "string" && /^\d{10,13}$/.test(data.whatsapp.replace(/\D/g, "")) && typeof data.id === "string" && /^[a-f0-9-]{36}$/i.test(data.id) && typeof data.professional === "string" && typeof data.date === "string" && typeof data.modality === "string" && validSelection(data.professional, data.date, data.modality) && /^([01]\d|2[0-3]):[0-5]\d$/.test(data.time) && data.consent === true && !data.website;
}
