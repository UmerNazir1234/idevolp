import Link from "next/link";
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="iDeveloped Skills Academy home" className="group flex items-center gap-3">
      <svg viewBox="0 0 48 48" className="h-11 w-11 shrink-0 transition-transform duration-300 group-hover:scale-105" aria-hidden>
        <rect width="48" height="48" rx="12" className="fill-brand" />
        <path d="M17 9h14l8 24c-5-4-10-6-15-6s-10 2-15 6z" fill="#fff" />
        <path d="M24 9v18M12 33c8-7 16-7 24 0" stroke="#a30000" strokeWidth="1.8" fill="none" />
        <path d="M10 40h28" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className={`block font-serif text-xl font-bold tracking-tight ${light ? "text-white" : "text-neutral-900"}`}>iDeveloped</span>
        <span className={`mt-1 block text-[11px] font-medium uppercase tracking-[0.28em] ${light ? "text-white/70" : "text-brand"}`}>Skills Academy</span>
      </span>
    </Link>
  );
}
