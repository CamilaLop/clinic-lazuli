import { NextRequest, NextResponse } from "next/server";
import { Appointment, appointmentIssue, todayInBrazil, validSelection } from "@/lib/agenda";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: object, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
function configured() { return Boolean(process.env.GOOGLE_SCRIPT_URL && process.env.AGENDA_SECRET); }
async function script(action: string, payload: object) {
  const endpoint = process.env.GOOGLE_SCRIPT_URL!;
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) throw new Error("invalid_config");
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, secret: process.env.AGENDA_SECRET, ...payload }), cache: "no-store", redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("upstream_failed");
  const data = await response.json();
  if (typeof data.ok !== "boolean") throw new Error("invalid_response");
  return data;
}
export async function GET(request: NextRequest) {
  if (!configured()) return reply({ mode: "whatsapp", slots: [] });
  const professional = request.nextUrl.searchParams.get("professional") || "";
  const date = request.nextUrl.searchParams.get("date") || "";
  const modality = request.nextUrl.searchParams.get("modality") || "";
  if (!validSelection(professional, date, modality)) return reply({ error: "Escolha uma profissional, uma data válida e a modalidade." }, 400);
  try {
    const data = await script("availability", { professional, date, modality });
    if (!data.ok || !Array.isArray(data.slots) || !data.slots.every((s: unknown) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s))) throw new Error("invalid_slots");
    return reply({ mode: "sheets", slots: data.slots });
  } catch { return reply({ error: "Não foi possível consultar os horários. Tente novamente em instantes." }, 503); }
}
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return reply({ error: "Origem inválida." }, 403);
  if (!configured()) return reply({ error: "O envio para a agenda ainda não está disponível." }, 503);
  try {
    const body = await request.text();
    if (body.length > 4096) return reply({ error: "Dados inválidos." }, 400);
    let data: Appointment;
    try { data = JSON.parse(body); }
    catch { return reply({ error: "Dados inválidos." }, 400); }
    const issue = appointmentIssue(data);
    if (issue) return reply({ error: issue.message, code: issue.code, field: issue.field, ...(issue.field === "date" ? { serverDate: todayInBrazil() } : {}) }, 400);
    const result = await script("request", { appointment: { id: data.id, name: data.name.trim(), whatsapp: data.whatsapp.replace(/\D/g, ""), professional: data.professional, date: data.date, time: data.time, modality: data.modality, consent: true } });
    if (!result.ok) {
      if (result.error === "slot_unavailable") return reply({ error: "Esse horário acabou de ser solicitado. Escolha outro horário.", code: "slot_unavailable" }, 409);
      if (result.error === "rate_limit") return reply({ error: "Você já enviou várias solicitações. Aguarde antes de tentar novamente." }, 429);
      throw new Error("request_failed");
    }
    if (result.id !== data.id) throw new Error("invalid_confirmation");
    return reply({ ok: true, id: result.id });
  } catch { return reply({ error: "Não foi possível enviar a solicitação. Tente novamente; seus dados continuam preenchidos." }, 503); }
}
