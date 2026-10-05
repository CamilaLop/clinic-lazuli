import { BrandLogo } from "./brand-logo";
import { Reveal } from "./reveal";
export function Footer() {
  return <Reveal as="footer" className="site-footer page-width"><BrandLogo /><p>Psicologia, vínculos e possibilidades.<br />Armação dos Búzios, RJ</p><div><p>© {new Date().getFullYear()} Lazuli</p><p className="footer-credit">Desenvolvido por Camila Lopes</p></div><a href="#inicio" aria-label="Voltar ao início" className="back-top">↑</a></Reveal>;
}
