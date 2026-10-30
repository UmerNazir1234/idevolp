import { MISSION } from "@/lib/config";
export default function MissionSection() {
  return (
    <section className="border-t-[6px] border-brand bg-page">
      <h2 className="border-b-[6px] border-brand py-2 text-center font-serif text-2xl font-bold text-white sm:text-[28px]">iDeveloped Skills Mission Statement</h2>
      <p className="animate-rise px-2 py-8 text-justify text-[17px] leading-[1.85] text-white sm:py-10">{MISSION}</p>
    </section>
  );
}
