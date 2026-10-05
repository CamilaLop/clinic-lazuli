export type ContactLink = { label: string; href: string; short: string; };
export type Professional = {
  name: string;
  crp: string;
  role: string;
  focus: string;
  photo: string;
  imageAlt: string;
  whatsappNumber: string;
  contacts: ContactLink[];
};
export type AudienceItem = { title: string; symbol: string; text: string; };
export type TherapyImportanceItem = { title: string; text: string; symbol: string; };
