export function ProfessionalPhoto({ src, alt, name }: { src: string; alt: string; name: string }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-[#181D3A]/10 bg-[#e9d6c4] shadow-sm">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#181D3A]/25 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
        {name}
      </div>
    </div>
  );
}
