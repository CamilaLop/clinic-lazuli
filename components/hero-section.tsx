import { CTAButton } from "./cta-button";
import { Header } from "./header";
import { ImageReveal, Reveal } from "./reveal";
export function HeroSection({ openSchedule, scrollToId }: { openSchedule: () => void; scrollToId: (id: string) => void }) {
  return (
    <section className="hero" id="inicio">
      <Header scrollToId={scrollToId} openSchedule={openSchedule} />
      <div className="hero-grid page-width">
        <div className="hero-copy">
          <Reveal as="p" className="eyebrow"><span className="small-line" /> Psicologia em Armação dos Búzios</Reveal>
          <Reveal as="h1" delay={0.08}>Há espaço<br />para a sua<br /><em>história.</em></Reveal>
          <Reveal as="p" className="hero-description" delay={0.18}>Um lugar de escuta, para compreender o que sente e construir novas formas de estar no mundo.</Reveal>
          <Reveal className="hero-actions" delay={0.28}><CTAButton label="Dar o primeiro passo" onClick={openSchedule} primary /><a href="#clinica" className="text-link">Conheça a Lazuli <span aria-hidden>↗</span></a></Reveal>
          <Reveal className="hero-note" delay={0.36}><span className="note-dot" /><p>Escuta com presença.<br /><span>Cuidado que respeita o seu tempo.</span></p></Reveal>
        </div>
        <Reveal as="figure" className="hero-figure" delay={0.12}>
          <div className="hero-image-wrap"><ImageReveal className="image-reveal-fill" delay={0.2}><img src="/images/atendimento.jpg" alt="Duas pessoas em um encontro de psicoterapia, sentadas em um ambiente acolhedor" fetchPriority="high" className="hero-image" /></ImageReveal><span className="image-label">UM ENCONTRO COM VOCÊ</span></div>
          <figcaption><span>01 / A ESCUTA</span><p>Cada encontro começa<br />com uma história.</p><span className="figure-star" aria-hidden>✳</span></figcaption>
        </Reveal>
      </div>
      <Reveal className="hero-bottom page-width" delay={0.1}><span>Presencial & online</span><a href="#clinica">Um tempo para você <span aria-hidden>↓</span></a><span>Espaço Psicoterapêutico</span></Reveal>
    </section>
  );
}
