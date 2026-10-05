export function FloatingScheduleButton({ onClick }: { onClick: () => void }) {
  return <button type="button" onClick={onClick} className="floating-schedule">Consultar agenda <span aria-hidden>↗</span></button>;
}
