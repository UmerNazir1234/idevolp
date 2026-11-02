import { MISSION } from "@/lib/config";
export default function MissionSection() {
  return (
    <section className="border-t-4 border-brand bg-page py-8 sm:py-11">
      <div className="site-container">
        <h2 className="border-b border-brand/25 pb-4 text-center font-serif text-2xl font-bold leading-tight text-neutral-900 sm:pb-5 sm:text-[30px]">iDeveloped Skills Mission Statement</h2>
        <p className="animate-rise mx-auto max-w-[850px] px-1 pt-6 text-center text-base leading-7 text-neutral-700 sm:pt-8 sm:text-[17px] sm:leading-8">{MISSION}</p>
      </div>
    </section>
  );
}
