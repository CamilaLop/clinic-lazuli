import { therapyImportance } from "@/data/site-data";
import { ImageReveal, Reveal } from "./reveal";
export function TherapyImportanceSection() {
  return (
    <section id="clinica" className="clinic-section">
      <div className="clinic-grid page-width">
        <div className="clinic-photo">
          <ImageReveal><img src="/images/bem-estar.jpg" alt="Uma mulher ao ar livre, em um momento de pausa" loading="lazy" /></ImageReveal>
          <Reveal as="p" delay={0.1}>Não é sobre ter todas as respostas.<br /><em>É sobre poder fazer perguntas.</em></Reveal>
        </div>
        <div className="clinic-copy">
          <Reveal as="p" className="eyebrow">01 / A Lazuli</Reveal>
          <Reveal as="h2" delay={0.08}>Uma pausa.<br />Uma conversa.<br /><em>Novas possibilidades.</em></Reveal>
          <Reveal as="p" className="clinic-intro" delay={0.14}>A Lazuli é um espaço de psicoterapia em Búzios. Aqui, acolhemos pessoas, vínculos e processos com uma escuta atenta à singularidade de cada história.</Reveal>
          <Reveal as="p" delay={0.2}>Não é preciso saber exatamente por onde começar. A psicoterapia oferece um espaço para olhar para o que você vive, no seu ritmo e com acompanhamento profissional.</Reveal>
          <div className="care-principles">
            {therapyImportance.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <span>0{i + 1}</span><div><h3>{item.title}</h3><p>{item.text}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
