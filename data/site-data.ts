export type ContactLink = {
  label: string;
  href: string;
  short: string;
};

export type Professional = {
  name: string;
  crp: string;
  role: string;
  focus: string;
  photo: string;
  imageAlt: string;
  contacts: ContactLink[];
};

export const siteLinks = {
  whatsapp: "https://wa.me/5500000000000",
  instagram: "https://instagram.com/SEUUSUARIOCLINICA",
  email: "mailto:contato@seudominio.com",
  maps: "https://maps.google.com/?q=Av.+Dois+55,+Manguinhos,+Armação+dos+Búzios",
};

// Contatos de exemplo ficam ocultos até serem substituídos pelos reais.
export function isConfiguredContact(href: string) {
  return Boolean(href) && !/SEUUSUARIO|seudominio|550000000000/i.test(href);
}

export const audience = [
  { title: "Adolescentes", symbol: "AD", text: "Acompanhamento sensível para identidade, vínculos, autoestima, ansiedade e desafios emocionais desta fase da vida." },
  { title: "Casais", symbol: "CA", text: "Escuta qualificada para diálogo, reconexão, conflitos, atravessamentos afetivos e novas formas de relação." },
  { title: "Famílias", symbol: "FA", text: "Cuidado voltado aos vínculos, à comunicação e à compreensão dos movimentos emocionais dentro do núcleo familiar." },
  { title: "Crianças", symbol: "CR", text: "Atendimento acolhedor e atento ao universo infantil, respeitando singularidades, desenvolvimento e expressão emocional." },
  { title: "TEA", symbol: "TE", text: "Acompanhamento individualizado, cuidadoso e ético, considerando necessidades, contexto, rotina e potencialidades." },
  { title: "Adultos em geral", symbol: "AG", text: "Um espaço para quem busca cuidado emocional, autoconhecimento, equilíbrio e mais qualidade nas relações." }
];

export const therapyImportance = [
  { title: "Autoconhecimento", symbol: "AC", text: "A psicoterapia ajuda a reconhecer emoções, padrões, necessidades e possibilidades com mais clareza e consciência." },
  { title: "Relações mais saudáveis", symbol: "RE", text: "O processo terapêutico fortalece a escuta, os limites, os vínculos e a forma como nos colocamos no mundo." },
  { title: "Cuidado mental contínuo", symbol: "CM", text: "Buscar terapia não é apenas reagir à dor, mas construir presença, equilíbrio e saúde emocional ao longo da vida." }
];

export const professionals: Professional[] = [
  {
    name: "Aline Reis",
    crp: "CRP 05/56279",
    role: "Psicóloga, Neuropsicopedagoga",
    focus: "Terapia de casal, família e adolescentes.",
    photo: "/professionals/aline-reis.jpg",
    imageAlt: "Foto de Aline Reis",
    contacts: [
      { label: "Instagram", href: "https://instagram.com/SEUUSUARIOALINE", short: "IG" },
      { label: "WhatsApp", href: "https://wa.me/5500000000001", short: "WA" },
      { label: "Email", href: "mailto:aline@seudominio.com", short: "EM" }
    ]
  },
  {
    name: "Géssyca Martins",
    crp: "CRP 05/51118",
    role: "Psicóloga infantojuvenil, Gestalt-terapeuta",
    focus: "Ludoterapeuta com atendimento voltado ao público infantil e juvenil.",
    photo: "/professionals/gessyca-placeholder.svg",
    imageAlt: "Foto placeholder de Géssyca Martins",
    contacts: [
      { label: "Instagram", href: "https://instagram.com/SEUUSUARIOGESSYCA", short: "IG" },
      { label: "WhatsApp", href: "https://wa.me/5500000000002", short: "WA" }
    ]
  },
  {
    name: "Laura Casanova",
    crp: "CRP 05/67715",
    role: "Psicóloga com ênfase em Gestalt-terapia",
    focus: "Atendimento voltado para adolescentes e adultos.",
    photo: "/professionals/laura-placeholder.svg",
    imageAlt: "Foto placeholder de Laura Casanova",
    contacts: [
      { label: "Instagram", href: "https://instagram.com/SEUUSUARIOLAURA", short: "IG" },
      { label: "WhatsApp", href: "https://wa.me/5500000000003", short: "WA" }
    ]
  }
];

export const availableSlots = ["08:00", "09:00", "10:30", "13:00", "15:00", "17:30", "19:00"];
