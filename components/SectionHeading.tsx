export default function SectionHeading({ children, icon = false, className = "" }: { children: React.ReactNode; icon?: boolean; className?: string }) {
  return (
    <div className={`border-b-2 border-brand/80 pb-3 ${className}`}>
      <h2 className="flex items-center justify-between gap-3 font-serif text-2xl font-bold leading-tight text-neutral-900 sm:text-[28px]">
        {children}
        {icon && <span aria-hidden className="h-6 w-6 shrink-0 rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-800 shadow-sm sm:h-7 sm:w-7" />}
      </h2>
    </div>
  );
}
