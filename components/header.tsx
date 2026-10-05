"use client";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "./brand-logo";
const links = [["clinica", "A clínica"], ["atendimentos", "Atendimentos"], ["profissionais", "Profissionais"], ["local", "Onde estamos"]];
export function Header({ scrollToId, openSchedule }: { scrollToId: (id: string) => void; openSchedule: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setIsOpen(false); toggle.current?.focus(); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [isOpen]);
  const navigate = (id: string) => { scrollToId(id); setIsOpen(false); };
  return <header className="site-header page-width">
    <a href="#inicio" aria-label="Lazuli — início" className="brand-link"><BrandLogo /></a>
    <nav className="desktop-nav" aria-label="Menu principal">{links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <button className="header-schedule" onClick={openSchedule}>Consultar agenda <span aria-hidden>↗</span></button>
    <button ref={toggle} type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls="mobile-menu" aria-label={isOpen ? "Fechar menu" : "Abrir menu"} className={`menu-toggle ${isOpen ? "is-open" : ""}`}><span /><span /></button>
    {isOpen && <nav className="mobile-nav" id="mobile-menu" aria-label="Menu do celular">{links.map(([id, label], i) => <button key={id} onClick={() => navigate(id)}><span>0{i + 1}</span>{label}<span aria-hidden>↗</span></button>)}<button onClick={() => { setIsOpen(false); openSchedule(); }}>Consultar agenda <span aria-hidden>↗</span></button></nav>}
  </header>;
}
