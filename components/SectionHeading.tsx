export default function SectionHeading({ children, icon = false, className = "" }: { children: React.ReactNode; icon?: boolean; className?: string }) {
  return (
    <div className={`border-b-[6px] border-brand pb-4 ${className}`}>
      <h2 className="flex items-center justify-between font-serif text-2xl font-bold text-white sm:text-[28px]">
        {children}
        {icon && <span aria-hidden className="h-7 w-7 rounded-full border-2 border-white/70 bg-gradient-to-br from-orange-400 to-orange-800" />}
      </h2>
    </div>
  );
}
