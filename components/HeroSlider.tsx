"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { SLIDES } from "@/lib/config";

export default function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = SLIDES.length;
  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 5000);
    return () => clearInterval(t);
  }, [paused, go]);

  return (
    <section aria-roledescription="carousel" aria-label="Featured photos" className="bg-white pb-7 sm:pb-9"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[56vw] max-h-[680px] min-h-[240px] overflow-hidden">
        <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, k) => (
            <div key={s.src} className="relative h-full w-full shrink-0" aria-hidden={k !== i}>
              <Image src={s.src} alt={s.alt} fill sizes="100vw" priority={k === 0} className="object-cover" />
            </div>
          ))}
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
        {(["prev", "next"] as const).map((d) => (
          <button key={d} aria-label={`${d} slide`} onClick={() => go(d === "next" ? 1 : -1)}
            className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/50 text-2xl text-white shadow-sm transition hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-12 sm:w-12 ${d === "prev" ? "left-3 sm:left-6" : "right-3 sm:right-6"}`}>
            {d === "prev" ? "‹" : "›"}
          </button>
        ))}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2.5 sm:gap-3">
          {SLIDES.map((_, k) => (
            <button key={k} aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}
              className={`h-2.5 w-2.5 rounded-full border border-white/80 shadow-sm transition sm:h-3 sm:w-3 ${k === i ? "scale-110 bg-brand" : "bg-white/90 hover:bg-white"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
