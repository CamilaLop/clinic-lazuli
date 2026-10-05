export function IconBadge({ children, dark = false, large = false }: { children: React.ReactNode; dark?: boolean; large?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-2xl border ${large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"} ${dark ? "border-white/15 bg-white/10 text-white" : "border-[#DA9B5C]/35 bg-[#F8F0E8] text-[#181D3A]"}`}>
      <span className="font-semibold tracking-[0.14em]">{children}</span>
    </div>
  );
}
