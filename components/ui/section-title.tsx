export function SectionTitle({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text: string; light?: boolean }) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#DA9B5C]">{eyebrow}</p>
      <h2 className={`text-3xl leading-tight md:text-5xl ${light ? "text-white" : "text-[#181D3A]"}`} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {title}
      </h2>
      <p className={`text-base leading-7 md:text-lg ${light ? "text-white/78" : "text-[#3E4768]"}`}>{text}</p>
    </div>
  );
}
