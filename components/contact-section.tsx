import { siteLinks, isConfiguredContact } from "@/data/site-data";
import { Reveal } from "./reveal";
export function ContactSection() {
  const contacts = [["WhatsApp", siteLinks.whatsapp], ["Instagram", siteLinks.instagram], ["E-mail", siteLinks.email]].filter(([, href]) => isConfiguredContact(href));
  return <section className="contact-section page-width"><Reveal as="p" className="eyebrow">Cuidado começa com escuta</Reveal><Reveal as="p" className="contact-statement" delay={0.1}>O que você sente<br /><em>tem lugar aqui.</em></Reveal><Reveal className="contact-links" delay={0.2}>{contacts.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-link">{label}<span aria-hidden>↗</span></a>)}</Reveal></section>;
}
