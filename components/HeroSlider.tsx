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
    <section aria-roledescription="carousel" aria-label="Featured photos" className="bg-white pb-16 sm:pb-20"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative h-[62vw] max-h-[700px] min-h-[260px] overflow-hidden ">
        <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${i * 100}%)` }}>
          {SLIDES.map((s, k) => (
            <div key={s.src} className="relative h-full w-full shrink-0" aria-hidden={k !== i}>
              <Image src={s.src} alt={s.alt} fill sizes="100vw" priority={k === 0} className="object-cover" />
            </div>
          ))}
        </div>
        {(["prev", "next"] as const).map((d) => (
          <button key={d} aria-label={`${d} slide`} onClick={() => go(d === "next" ? 1 : -1)}
            className={`absolute top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-2xl text-white transition hover:bg-brand sm:flex ${d === "prev" ? "left-4" : "right-4"}`}>
            {d === "prev" ? "‹" : "›"}
          </button>
        ))}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3.5">
          {SLIDES.map((_, k) => (
            <button key={k} aria-label={`Go to slide ${k + 1}`} aria-current={k === i} onClick={() => setI(k)}
              className={`h-3 w-3 rounded-full transition ${k === i ? "scale-110 bg-brand" : "bg-white hover:bg-white/70"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
