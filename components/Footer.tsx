"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { SITE, SOCIALS } from "@/lib/config";
import {
  DEFAULT_NAVIGATION,
  getNavigationItems,
  NavigationItem,
  subscribeToDemoChanges,
} from "@/lib/demo-store";

const programLabels = new Set(["Team League Sign-Up", "Individual League Sign-Up", "Training", "Camps", "Volleyball", "Elite Summer Circuit"]);
const h = "mb-5 font-serif text-lg font-bold text-white";
const a = "text-white/70 transition hover:text-white hover:underline";

function leafItems(item: NavigationItem, items: NavigationItem[]): NavigationItem[] {
  const children = items.filter((candidate) => candidate.parentId === item.id);
  return children.length ? children.flatMap((child) => leafItems(child, items)) : [item];
}

export default function Footer() {
  const isHome = usePathname() === "/";
  const [navigation, setNavigation] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);

  useEffect(() => {
    const refresh = () => setNavigation(getNavigationItems().filter((item) => item.enabled));
    refresh();
    return subscribeToDemoChanges(refresh);
  }, []);

  const roots = navigation.filter((item) => !item.parentId);
  const programs = roots.filter((item) => programLabels.has(item.label)).flatMap((item) => leafItems(item, navigation));
  const quick = roots.filter((item) => !programLabels.has(item.label)).flatMap((item) => leafItems(item, navigation));
  const dayPass = navigation.find((item) => item.label.toLowerCase() === "day pass");

  return (
    <footer className="bg-site relative isolate text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#2a0000]/95 to-[#120000]/98" />
      <div className="h-1.5 bg-brand" />
      <div className={`site-container mx-auto grid max-w-[1400px] px-6 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] ${isHome ? "gap-9 py-11 sm:gap-10 sm:py-14" : "gap-12 py-16"}`}>
        <div>
          <Logo light />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">Connecting youth and adults to sports and education in Baton Rouge since 2014.</p>
          <div className={`mt-6 flex gap-3 ${isHome ? "flex-wrap" : ""}`}>
            {SOCIALS.map((s) => (
              <a key={s} href="#" aria-label={s} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 transition hover:border-brand hover:bg-brand">
                <Image src={`/images/content/${s.toLowerCase()}.png`} alt="" width={24} height={24} className="object-contain" />
              </a>
            ))}
          </div>
        </div>
        <nav aria-label="Programs"><h3 className={h}>Programs</h3><ul className="space-y-3 text-sm">{programs.map((item) => <li key={item.id}><Link href={item.href} className={a}>{item.label}</Link></li>)}</ul></nav>
        <nav aria-label="Quick links"><h3 className={h}>Quick Links</h3><ul className="space-y-3 text-sm">{quick.map((item) => <li key={item.id}><Link href={item.href} className={a}>{item.label}</Link></li>)}</ul></nav>
        <div>
          <h3 className={h}>Visit Us</h3>
          <address className="space-y-3 text-sm not-italic text-white/70">
            <p>{SITE.address}</p>
            <p><a href={`mailto:${SITE.email}`} className={a}>{SITE.email}</a></p>
            <p><a href={`tel:${SITE.phone.replace(/\./g, "")}`} className={a}>{SITE.phone}</a></p>
          </address>
          {/* {dayPass && <Link href={dayPass.href} className="mt-6 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-white hover:text-brand">Get a Day Pass</Link>} */}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className={`site-container mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-5 text-xs sm:flex-row sm:justify-between ${isHome ? "text-white/60" : "text-white/50"}`}>
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Built with Next.js</p>
        </div>
      </div>
    </footer>
  );
}
