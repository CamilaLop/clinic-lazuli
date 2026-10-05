type Props = { label: string; onClick?: () => void; href?: string; light?: boolean; primary?: boolean; disabled?: boolean };
export function CTAButton({ label, onClick, href, light = false, primary = false, disabled = false }: Props) {
  const className = `button ${primary ? "button-primary" : "button-outline"} ${light ? "button-light" : ""}`;
  const content = <>{label}<span aria-hidden>↗</span></>;
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a> : <button type="button" onClick={onClick} disabled={disabled} className={className}>{content}</button>;
}
