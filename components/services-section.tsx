"use client";
import { useState } from "react";
import { audience } from "@/data/site-data";
import { Reveal } from "./reveal";
export function ServicesSection({ openSchedule }: { openSchedule: () => void }) {
  const [active, setActive] = useState<number | null>(0);
  return <section id="atendimentos" className="services-section section-space page-width"><Reveal><div className="section-heading"><p className="eyebrow">02 / Formas de cuidar</p><div><h2>Histórias diferentes.<br /><em>Um cuidado singular.</em></h2><p>Em cada fase da vida, há novas perguntas. Nosso trabalho começa por escutar as suas.</p></div></div></Reveal><div className="services-list">{audience.map((item, i) => <Reveal key={item.title} delay={i * 0.025}><div className={`service-row ${active === i ? "service-active" : ""}`}><h3><button aria-expanded={active === i} aria-controls={`service-${i}`} onClick={() => setActive(active === i ? null : i)}><span className="service-number">0{i + 1}</span><span>{item.title}</span><span className="service-toggle" aria-hidden>{active === i ? "−" : "+"}</span></button></h3><div className="service-detail" id={`service-${i}`} hidden={active !== i}><p>{item.text}</p><button onClick={openSchedule} className="text-link">Conversar sobre o atendimento <span aria-hidden>↗</span></button></div></div></Reveal>)}</div></section>;
}
