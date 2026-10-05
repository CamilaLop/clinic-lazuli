import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
const editorial = localFont({ src: [
  { path: "../public/fonts/editorial-2.ttf", weight: "400", style: "normal" },
  { path: "../public/fonts/editorial-0.ttf", weight: "400", style: "italic" }
], variable: "--font-editorial", display: "swap" });
const sans = localFont({ src: [
  { path: "../public/fonts/sans-0.ttf", weight: "400", style: "normal" },
  { path: "../public/fonts/sans-1.ttf", weight: "500", style: "normal" },
  { path: "../public/fonts/sans-2.ttf", weight: "600", style: "normal" },
  { path: "../public/fonts/sans-3.ttf", weight: "700", style: "normal" }
], variable: "--font-sans", display: "swap" });
export const metadata: Metadata = {
  title: "Lazuli | Espaço Psicoterapêutico em Búzios",
  description: "Um espaço de escuta e cuidado em Armação dos Búzios. Psicoterapia para crianças, adolescentes, adultos, casais e famílias. Atendimento presencial e online.",
  openGraph: { title: "Lazuli | Há espaço para a sua história", description: "Psicologia, vínculos e possibilidades em Armação dos Búzios.", locale: "pt_BR", type: "website" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR" className={`${editorial.variable} ${sans.variable}`}><body><noscript><style>{`[data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}.image-reveal-content{transform:none!important}`}</style></noscript>{children}</body></html>;
}
