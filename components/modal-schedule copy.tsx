"use client";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { availableSlots, isConfiguredContact, professionals, siteLinks } from "@/data/site-data";
import { todayInBrazil, validSelection } from "@/lib/agenda";
import { createRequestId } from "@/lib/request-id";
import { BrandLogo } from "./brand-logo";

type Props = { open: boolean; onClose: () => void; initialProfessional?: string };
type Mode = "loading" | "whatsapp" | "sheets" | "error";
export function ModalSchedule({ open, onClose, initialProfessional = "Aline Reis" }: Props) {
  const [form, setForm] = useState({ name: "", whatsapp: "", professional: initialProfessional, date: "", time: "", modality: "presencial", consent: false, website: "" });
  const [mode, setMode] = useState<Mode>("loading");
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  sendingRef.current = sending;
  const [success, setSuccess] = useState("");
  const [refresh, setRefresh] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const requestKey = useRef({ fingerprint: "", id: "" });
  const professional = useMemo(() => professionals.find(p => p.name === form.professional) || professionals[0], [form.professional]);
  const contact = professional.contacts.find(c => c.label === "WhatsApp" && isConfiguredContact(c.href))?.href || (isConfiguredContact(siteLinks.whatsapp) ? siteLinks.whatsapp : "");
  useEffect(() => {
    if (open) { setForm(f => ({ ...f, professional: initialProfessional, date: f.date || todayInBrazil() })); setSuccess(""); setError(""); }
  }, [open, initialProfessional]);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sendingRef.current) onClose();
      if (event.key !== "Tab") return;
      const all = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not([type="hidden"]), select, textarea, [tabindex="0"]');
      const focusable = Array.from(all || []).filter(el => !el.matches(':disabled') && !el.closest('.honeypot') && el.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = overflow; document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, onClose]);
  useEffect(() => {
    if (!open || !form.date) return;
    const controller = new AbortController();
    setMode("loading"); setSlots([]); setForm(f => ({ ...f, time: "" }));
    const query = new URLSearchParams({ professional: form.professional, date: form.date, modality: form.modality });
    fetch(`/api/agenda?${query}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then(data => { setMode(data.mode); setSlots(data.mode === "sheets" ? data.slots : availableSlots); })
      .catch(e => { if (e.name !== "AbortError") { setMode("error"); setError(e.message || "Não foi possível consultar a agenda."); } });
    return () => controller.abort();
  }, [open, form.professional, form.date, form.modality, refresh]);
  const update = (key: keyof typeof form, value: string | boolean) => { setForm(f => ({ ...f, [key]: value })); setError(""); };
  function submissionIssue(): { message: string; field?: string } | null {
    if (mode === "loading") return { message: "Aguarde a consulta dos horários antes de enviar." };
    if (mode === "error") return { message: error || "Não foi possível consultar a agenda. Clique em Consultar novamente." };
    if (mode === "whatsapp" && !contact) return { message: "O contato para agendamento ainda não está disponível. Tente novamente mais tarde." };
    if (form.name.trim().length < 2 || form.name.length > 100) return { message: "Informe seu nome, com pelo menos dois caracteres.", field: "name" };
    if (!/^\d{10,13}$/.test(form.whatsapp.replace(/\D/g, ""))) return { message: "Informe um WhatsApp válido, incluindo o DDD.", field: "whatsapp" };
    if (!validSelection(form.professional, form.date, form.modality)) return { message: "Escolha uma data válida, a partir de hoje.", field: "date" };
    if (mode === "sheets" && slots.length === 0) return { message: "Não há horários disponíveis nesta data. Escolha outro dia ou outra modalidade.", field: "date" };
    if (!form.time || !slots.includes(form.time)) return { message: "Selecione um dos horários disponíveis.", field: "time" };
    if (!form.consent) return { message: "Marque a autorização para que a clínica possa responder à sua solicitação.", field: "consent" };
    if (form.website) return { message: "Não foi possível enviar sua solicitação. Atualize a página e tente novamente." };
    return null;
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sendingRef.current) return;
    const issue = submissionIssue();
    if (issue) {
      setError(issue.message);
      const selector = issue.field === "time" ? ".time-options button" : issue.field ? `[name="${issue.field}"]` : "";
      if (selector) dialog.current?.querySelector<HTMLElement>(selector)?.focus();
      return;
    }
    setError("");
    if (mode === "whatsapp") {
      const date = form.date.split("-").reverse().join("/");
      const message = [`Olá! Gostaria de consultar um atendimento na Lazuli.`, `Nome: ${form.name.trim()}`, `WhatsApp: ${form.whatsapp}`, `Profissional: ${form.professional}`, `Data preferida: ${date}`, `Horário preferido: ${form.time}`, `Modalidade: ${form.modality}`, "Entendo que o atendimento depende da confirmação da clínica."].join("\n");
      window.open(`${contact}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return;
    }
    sendingRef.current = true;
    setSending(true);
    try {
      const fingerprint = JSON.stringify(form);
      if (requestKey.current.fingerprint !== fingerprint) requestKey.current = { fingerprint, id: createRequestId() };
      const response = await fetch("/api/agenda", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: requestKey.current.id }) });
      const data = await response.json();
      if (!response.ok) { if (data.code === "slot_unavailable") setRefresh(r => r + 1); throw new Error(data.error); }
      setSuccess(data.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível enviar. Tente novamente."); }
    finally { sendingRef.current = false; setSending(false); }
  }
  if (!open) return null;
  return <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget && !sending) onClose(); }}><div className="schedule-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="schedule-title" tabIndex={-1}>
    <button className="modal-close" aria-label="Fechar agenda" onClick={onClose} disabled={sending}>×</button>
    <aside className="schedule-aside"><BrandLogo /><h2>Um tempo<br /> <em>para você.</em></h2><p>O primeiro contato pode ser simples. Escolha como deseja começar e vamos combinar o próximo passo.</p><p className="schedule-small">LAZULI / ESPAÇO PSICOTERAPÊUTICO<br />Armação dos Búzios, RJ</p></aside>
    <div className="schedule-main"><p className="eyebrow">Um primeiro encontro</p><h3 id="schedule-title">Consultar agenda</h3>
      {success ? <div className="success-panel" role="status"><span className="success-symbol" aria-hidden>✓</span><h3>Seu primeiro passo<br /><em>chegou até nós.</em></h3><p>Solicitação recebida para {form.professional}, em {form.date.split("-").reverse().join("/")} às {form.time}. Entraremos em contato pelo WhatsApp informado para confirmar o atendimento.</p><p>O atendimento ainda aguarda confirmação da clínica.</p><p className="success-reference">Protocolo: {success.slice(0, 8).toUpperCase()}</p><button onClick={onClose} className="button button-primary">Concluir <span aria-hidden>↗</span></button></div> : <><p className="schedule-description">Escolha a profissional e o melhor dia para o seu atendimento.</p>
      <form onSubmit={submit} className="schedule-form" noValidate aria-describedby={error ? "schedule-feedback" : undefined}>
        <label className="form-wide"><span className="field-label">Seu nome</span><input name="name" className="form-input" autoComplete="name" required minLength={2} maxLength={100} value={form.name} onChange={e => update("name", e.target.value)} placeholder="Como podemos chamar você?" disabled={sending} /></label>
        <label className="form-wide"><span className="field-label">WhatsApp para contato</span><input name="whatsapp" type="tel" className="form-input" autoComplete="tel" required maxLength={22} value={form.whatsapp} onChange={e => update("whatsapp", e.target.value)} placeholder="(22) 99999-9999" disabled={sending} /></label>
        <label className="form-wide"><span className="field-label">Profissional</span><select className="form-input" value={form.professional} onChange={e => update("professional", e.target.value)} disabled={sending}>{professionals.map(p => <option key={p.name}>{p.name}</option>)}</select></label>
        <label><span className="field-label">Data {mode === "whatsapp" ? "preferida" : "do atendimento"}</span><input name="date" className="form-input" type="date" required min={todayInBrazil()} value={form.date} onChange={e => update("date", e.target.value)} disabled={sending} /></label>
        <label><span className="field-label">Modalidade</span><select className="form-input" value={form.modality} onChange={e => update("modality", e.target.value)} disabled={sending}><option value="presencial">Presencial</option><option value="online">Online</option></select></label>
        <div className="form-wide"><p className="field-label">{mode === "whatsapp" ? "Preferência de horário" : "Horários disponíveis"}</p><div aria-live="polite">{mode === "loading" && <p className="slots-message">Consultando horários…</p>}{mode === "sheets" && slots.length === 0 && <p className="slots-message">Não há horários disponíveis nesta data. Escolha outro dia ou outra modalidade.</p>}{mode === "whatsapp" && <p className="slots-message">Informe sua preferência. A disponibilidade será combinada pelo WhatsApp.</p>}</div><div className="time-options" role="group" aria-label="Escolher horário">{slots.map(time => <button key={time} type="button" aria-pressed={form.time === time} onClick={() => update("time", time)} disabled={sending}>{time}</button>)}</div>{mode === "error" && <button type="button" className="text-link" onClick={() => { setError(""); setRefresh(r => r + 1); }}>Consultar novamente <span aria-hidden>↗</span></button>}</div>
        <label className="form-wide consent-label"><input name="consent" type="checkbox" checked={form.consent} onChange={e => update("consent", e.target.checked)} required disabled={sending} /><span>Autorizo a Lazuli a usar meu nome e WhatsApp para responder a esta solicitação. O atendimento depende de confirmação.</span></label>
        <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update("website", e.target.value)} /></label>
        {mode === "whatsapp" && !contact && <p className="form-wide slots-message">O contato para agendamento ainda não está disponível. Tente novamente mais tarde.</p>}
        {error && <p id="schedule-feedback" className="form-wide form-feedback" role="alert">{error}</p>}
        <button type="submit" className="form-wide button button-primary schedule-submit" disabled={sending}>{sending ? "Enviando solicitação…" : mode === "whatsapp" ? "Consultar pelo WhatsApp" : "Solicitar atendimento"}<span aria-hidden>↗</span></button>
      </form></>}
    </div>
  </div></div>;
}
