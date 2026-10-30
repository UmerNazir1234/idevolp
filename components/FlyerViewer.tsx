"use client";

import { useEffect, useState } from "react";
import { MenuFlyer } from "@/lib/demo-store";
import { resolveMenuFlyerUrl } from "@/lib/menu-service";

export default function FlyerViewer({ flyer, title }: { flyer?: MenuFlyer; title: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setUrl("");
    setError("");
    setZoomed(false);
    if (!flyer) return;
    resolveMenuFlyerUrl(flyer).then((resolved) => {
      objectUrl = resolved.startsWith("blob:") ? resolved : "";
      if (active) setUrl(resolved);
      else if (objectUrl) URL.revokeObjectURL(objectUrl);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "The flyer could not be loaded.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [flyer]);

  if (!flyer) {
    return <p className="rounded-xl border border-white/15 bg-black/20 p-5 text-white/75">No flyer has been added to this sub-menu yet.</p>;
  }
  if (error) return <p role="alert" className="rounded-xl bg-red-950 p-5 text-white">{error}</p>;
  if (!url) return <p role="status" className="rounded-xl bg-black/30 p-5 text-white/75">Loading flyer…</p>;

  return (
    <section className="space-y-4" aria-label={`${title} flyer`}>
      {flyer.type === "pdf" ? (
        <div className="overflow-hidden rounded-xl bg-white">
          <iframe title={`${title} flyer PDF`} src={url} className="h-[65vh] min-h-96 w-full sm:h-[75vh]" />
          <div className="border-t border-neutral-200 p-4">
            <a href={url} download={flyer.name} className="inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">Download PDF</a>
          </div>
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setZoomed(true)} aria-label={`Zoom in on ${title} flyer`} className="block w-full cursor-zoom-in rounded-xl bg-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`${title} flyer`} className="mx-auto block h-auto max-h-[78vh] w-full object-contain" />
          </button>
          {zoomed && (
            <div role="dialog" aria-modal="true" aria-label={`${title} flyer enlarged`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomed(false)} onKeyDown={(event) => { if (event.key === "Escape") setZoomed(false); }}>
              <button type="button" autoFocus aria-label="Close enlarged flyer" onClick={() => setZoomed(false)} className="absolute right-4 top-4 rounded-full bg-white px-4 py-2 font-bold text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Close</button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${title} flyer enlarged`} onClick={(event) => event.stopPropagation()} className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </>
      )}
    </section>
  );
}
